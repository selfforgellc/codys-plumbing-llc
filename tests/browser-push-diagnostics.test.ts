import { createHash, webcrypto } from "node:crypto";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { readPushDiagnostics } from "../client/src/lib/pushDiagnostics";

const configured = Uint8Array.of(4, ...new Uint8Array(64).fill(42));
const subscribed = Uint8Array.of(4, ...new Uint8Array(64).fill(43));
const fingerprint = (key: Uint8Array) => createHash("sha256").update(key).digest("hex").slice(0, 12);
const getSubscription = vi.fn();
const getRegistration = vi.fn();
const fetchConfig = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("window", { PushManager: {} });
  vi.stubGlobal("navigator", { serviceWorker: { getRegistration } });
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("fetch", fetchConfig);
  getRegistration.mockResolvedValue({ pushManager: { getSubscription } });
  fetchConfig.mockResolvedValue({
    ok: true,
    json: async () => ({ publicKey: Buffer.from(configured).toString("base64url") }),
  });
});

afterEach(() => vi.unstubAllGlobals());

it.each([["Match", configured], ["Mismatch", subscribed]] as const)(
  "reports %s from the subscription bytes",
  async (label, key) => {
    getSubscription.mockResolvedValue({ options: { applicationServerKey: key.buffer } });
    expect(await readPushDiagnostics()).toBe(
      `${label} · Subscription ${fingerprint(key)} · Configured ${fingerprint(configured)}`,
    );
    expect(getRegistration).toHaveBeenCalledWith("/sw.js");
    expect(fetchConfig).toHaveBeenCalledOnce();
    expect(fetchConfig).toHaveBeenCalledWith("/api/push/config", { cache: "no-store" });
  },
);

it.each([
  [null, "No existing push subscription for this site."],
  [{ options: { applicationServerKey: null } }, "The browser did not provide the subscription’s application server key."],
])("reports an unavailable subscription key safely", async (subscription, message) => {
  getSubscription.mockResolvedValue(subscription);
  expect(await readPushDiagnostics()).toBe(message);
  expect(fetchConfig).not.toHaveBeenCalled();
});

it("omits raw error details when reading configuration fails", async () => {
  getSubscription.mockResolvedValue({ options: { applicationServerKey: subscribed.buffer } });
  fetchConfig.mockRejectedValue(new Error("secret-response"));
  expect(await readPushDiagnostics()).toBe(
    "Push diagnostics are unavailable. Check that this site is secure and push is configured.",
  );
});
