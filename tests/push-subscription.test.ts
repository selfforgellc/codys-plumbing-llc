import { expect, it, vi } from "vitest";
import { getCurrentPushSubscription } from "../client/src/lib/pushSubscription";

const currentKey = Uint8Array.of(4, ...new Uint8Array(64).fill(42));
const oldKey = Uint8Array.of(4, ...new Uint8Array(64).fill(43));
const publicKey = Buffer.from(currentKey).toString("base64url");

function fixture(existingKey?: ArrayBuffer) {
  const unsubscribe = vi.fn().mockResolvedValue(true);
  const existing = existingKey && { options: { applicationServerKey: existingKey }, unsubscribe };
  const fresh = { endpoint: "https://example.invalid/fresh" };
  const getSubscription = vi.fn().mockResolvedValue(existing ?? null);
  const subscribe = vi.fn().mockResolvedValue(fresh);
  const manager = { getSubscription, subscribe } as unknown as PushManager;
  return { manager, existing, fresh, unsubscribe, subscribe, getSubscription };
}

it("keeps an existing subscription that already uses the live key", async () => {
  const f = fixture(currentKey.buffer);
  expect(await getCurrentPushSubscription(f.manager, publicKey)).toBe(f.existing);
  expect(f.unsubscribe).not.toHaveBeenCalled();
  expect(f.subscribe).not.toHaveBeenCalled();
});

it("replaces an old subscription before subscribing with the live key", async () => {
  const f = fixture(oldKey.buffer);
  expect(await getCurrentPushSubscription(f.manager, publicKey)).toBe(f.fresh);
  expect(f.unsubscribe.mock.invocationCallOrder[0]).toBeLessThan(f.subscribe.mock.invocationCallOrder[0]);
  expect(f.subscribe).toHaveBeenCalledWith({ userVisibleOnly: true, applicationServerKey: currentKey });
});

it("subscribes a device without a saved browser subscription", async () => {
  const f = fixture();
  expect(await getCurrentPushSubscription(f.manager, publicKey)).toBe(f.fresh);
  expect(f.unsubscribe).not.toHaveBeenCalled();
});

it("preserves the old subscription if the server key is invalid", async () => {
  const f = fixture(oldKey.buffer);
  await expect(getCurrentPushSubscription(f.manager, "bad-key")).rejects.toThrow("invalid");
  expect(f.unsubscribe).not.toHaveBeenCalled();
});

it("stops when the old subscription cannot be removed", async () => {
  const f = fixture(oldKey.buffer);
  f.unsubscribe.mockResolvedValue(false);
  await expect(getCurrentPushSubscription(f.manager, publicKey)).rejects.toThrow("Could not refresh");
  expect(f.subscribe).not.toHaveBeenCalled();
});

