function decodePushKey(publicKey: string) {
  const padding = "=".repeat((4 - publicKey.length % 4) % 4);
  const base64 = (publicKey + padding).replace(/-/g, "+").replace(/_/g, "/");
  const applicationServerKey = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  if (applicationServerKey.length !== 65 || applicationServerKey[0] !== 4) {
    throw new Error("The push public key is invalid.");
  }

  return applicationServerKey;
}

function usesPushKey(subscription: PushSubscription, key: Uint8Array) {
  const existingKey = subscription.options.applicationServerKey;
  return existingKey?.byteLength === key.length &&
    new Uint8Array(existingKey).every((byte, index) => byte === key[index]);
}

export function matchesPushKey(subscription: PushSubscription, publicKey: string) {
  return usesPushKey(subscription, decodePushKey(publicKey));
}

export async function getCurrentPushSubscription(pushManager: PushManager, publicKey: string) {
  const applicationServerKey = decodePushKey(publicKey);
  const existing = await pushManager.getSubscription();
  if (existing) {
    if (usesPushKey(existing, applicationServerKey)) return existing;
    if (!(await existing.unsubscribe()) && await pushManager.getSubscription()) {
      throw new Error("Could not refresh this device’s push subscription. Try enabling notifications again.");
    }
  }
  return pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
}

