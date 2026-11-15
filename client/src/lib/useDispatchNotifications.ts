import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getCurrentPushSubscription, matchesPushKey } from "./pushSubscription";

type NotificationState = "checking" | "enabling" | "enabled" | "off" | "blocked" | "stale" | "error";

async function getPublicKey(): Promise<string> {
  const response = await fetch("/api/push/config", { cache: "no-store" });
  const { publicKey, error } = await response.json();
  if (!response.ok || typeof publicKey !== "string") throw new Error(error || "Push notifications are not configured.");
  return publicKey;
}

async function saveSubscription(subscription: PushSubscription) {
  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });
  if (!response.ok) throw new Error("Could not save this device.");
}

export function useDispatchNotifications(signedIn: boolean) {
  const [state, setState] = useState<NotificationState>("checking");
  const inProgress = useRef(false);

  const synchronize = useCallback(async (enable: boolean) => {
    if (inProgress.current) return;
    inProgress.current = true;

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState("off");
        if (enable) toast.error("Use Chrome on Android, or open Cody’s Dispatch from your iPhone Home Screen.");
        return;
      }

      if (enable) setState("enabling");
      // Only the button asks for permission. Reloads inspect the device's existing permission.
      const permission = enable ? await Notification.requestPermission() : Notification.permission;
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "off");
        if (enable) toast.error("Allow Dispatch notifications in your browser or device settings.");
        return;
      }

      let subscription: PushSubscription | null;
      if (enable) {
        await navigator.serviceWorker.register("/sw.js");
        const registration = await navigator.serviceWorker.ready;
        subscription = await getCurrentPushSubscription(registration.pushManager, await getPublicKey());
      } else {
        const registration = await navigator.serviceWorker.getRegistration("/");
        subscription = await registration?.pushManager.getSubscription() ?? null;
        if (!subscription) {
          setState("off");
          return;
        }
        if (!matchesPushKey(subscription, await getPublicKey())) {
          setState("stale");
          return;
        }
      }

      await saveSubscription(subscription);
      setState("enabled");
      if (enable) toast.success("Push notifications enabled on this device.");
    } catch (error) {
      setState("error");
      if (enable) toast.error(error instanceof Error ? error.message : "Could not enable notifications.");
    } finally {
      inProgress.current = false;
    }
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    function checkWhenVisible() {
      if (document.visibilityState === "visible") void synchronize(false);
    }

    checkWhenVisible();
    document.addEventListener("visibilitychange", checkWhenVisible);
    return () => document.removeEventListener("visibilitychange", checkWhenVisible);
  }, [signedIn, synchronize]);

  return { state, enable: () => synchronize(true) };
}
