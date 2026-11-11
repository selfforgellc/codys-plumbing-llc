export function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

export async function readPushDiagnostics() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return "Push diagnostics are unavailable in this browser.";
    }
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) {
      return "No existing push subscription for this site.";
    }
    const applicationServerKey = subscription.options?.applicationServerKey;
    if (!applicationServerKey?.byteLength) {
      return "The browser did not provide the subscription’s application server key.";
    }
    const response = await fetch("/api/push/config", { cache: "no-store" });
    if (!response.ok) throw new Error("Push configuration unavailable");
    const { publicKey } = await response.json();
    const configuredKey = urlBase64ToUint8Array(publicKey);
    if (configuredKey.length !== 65 || configuredKey[0] !== 4) {
      throw new Error("Invalid push public key");
    }
    const subscribedKey = new Uint8Array(applicationServerKey);
    const matches = subscribedKey.length === configuredKey.length &&
      subscribedKey.every((byte, index) => byte === configuredKey[index]);
    const [subscriptionFingerprint, configuredFingerprint] = await Promise.all([
      pushKeyFingerprint(subscribedKey),
      pushKeyFingerprint(configuredKey),
    ]);
    return `${matches ? "Match" : "Mismatch"} · Subscription ${subscriptionFingerprint} · Configured ${configuredFingerprint}`;
  } catch {
    return "Push diagnostics are unavailable. Check that this site is secure and push is configured.";
  }
}

async function pushKeyFingerprint(key: Uint8Array) {
  const hash = await crypto.subtle.digest("SHA-256", key);
  return Array.from(new Uint8Array(hash).slice(0, 6), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
