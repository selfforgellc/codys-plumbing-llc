import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import requests from "../api/requests.js";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  sendNotification: vi.fn(),
  setVapidDetails: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ from: mocks.from }) }));
vi.mock("web-push", () => ({ default: mocks }));

const input = {
  name: "Test Customer", phone: "555-0100", address: "Test address", city: "Test City",
  service_type: "Leak", description: "Fixture request", preferred_time: "Tomorrow",
};
const request = { ...input, id: "request-fixture", is_emergency: false, status: "New" };
const subscription = { endpoint: "https://example.invalid/secret-endpoint", keys: { auth: "secret-auth" } };
const keyBytes = Buffer.concat([Buffer.of(4), Buffer.alloc(64, 42)]);
const publicKey = keyBytes.toString("base64url");

async function submitRequest() {
  const req = {
    method: "POST",
    async *[Symbol.asyncIterator]() { yield JSON.stringify(input); },
  } as Parameters<typeof requests>[0];
  const res = { statusCode: 0, setHeader: vi.fn(), end: vi.fn() };
  await requests(req, res as unknown as Parameters<typeof requests>[1]);
  expect(res.statusCode).toBe(201);
  expect(res.end).toHaveBeenCalledWith(JSON.stringify({ request }));
}

describe("push delivery diagnostics", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("VAPID_SUBJECT", "mailto:dispatch@example.invalid");
    vi.stubEnv("VAPID_PUBLIC_KEY", publicKey);
    vi.stubEnv("VAPID_PRIVATE_KEY", "secret-private");
    vi.stubEnv("SUPABASE_URL", "https://database.example.invalid");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "secret-database");
    mocks.from.mockImplementation((table) => table === "service_requests"
      ? { insert: () => ({ select: () => ({ single: async () => ({ data: request }) }) }) }
      : { select: async () => ({ data: [{ id: "row-fixture", subscription }] }),
          delete: () => ({ eq: mocks.remove }) });
    mocks.remove.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it.each([
    [403, "the VAPID credentials in the authorization header do not correspond to the credentials used to create the subscriptions.\n", "vapid_subscription_credentials_mismatch"],
    [403, "secret-provider-body", "provider_forbidden"],
    [403, { error: "secret-provider-body" }, "provider_forbidden"],
    [401, "secret-provider-body", "provider_unauthorized"],
    [410, "secret-provider-body", "subscription_unavailable"],
    [undefined, "secret-provider-body", "no_provider_status"],
  ])("classifies HTTP %s safely and still saves the request (%s)", async (statusCode, body, category) => {
    mocks.sendNotification.mockRejectedValue({ statusCode, body, endpoint: subscription.endpoint });
    await submitRequest();
    expect(mocks.sendNotification).toHaveBeenCalledOnce();
    expect(mocks.sendNotification).toHaveBeenCalledWith(subscription, JSON.stringify({
      title: "New plumbing request",
      body: "Test Customer · Test City · Leak",
      requestId: request.id,
      url: `/admin?request=${request.id}`,
    }));
    expect(console.error).toHaveBeenCalledWith("[push] Delivery rejected by push service", {
      requestId: request.id, statusCode: statusCode ?? null, category,
    });
    expect(console.info).toHaveBeenCalledWith("[push] VAPID configuration diagnostics", {
      requestId: request.id,
      subjectFormat: "mailto",
      configuredKeyFingerprint: createHash("sha256").update(keyBytes).digest("hex").slice(0, 12),
    });
    const logs = JSON.stringify([vi.mocked(console.info).mock.calls, vi.mocked(console.error).mock.calls]);
    for (const value of [subscription.endpoint, publicKey, "secret-", "dispatch@example.invalid", input.name]) {
      expect(logs).not.toContain(value);
    }
    if (statusCode === 410) expect(mocks.remove).toHaveBeenCalledWith("id", "row-fixture");
    else expect(mocks.remove).not.toHaveBeenCalled();
  });

  it("keeps accepted delivery and reports an HTTPS subject format", async () => {
    vi.stubEnv("VAPID_SUBJECT", "https://example.invalid/contact");
    mocks.sendNotification.mockResolvedValue({ statusCode: 201 });
    await submitRequest();
    expect(console.info).toHaveBeenCalledWith("[push] VAPID configuration diagnostics",
      expect.objectContaining({ subjectFormat: "https" }));
    expect(console.info).toHaveBeenCalledWith("[push] Delivery accepted by push service",
      { requestId: request.id, statusCode: 201 });
    expect(console.error).not.toHaveBeenCalled();
  });

  it("reports invalid subject syntax and suppresses raw configuration errors", async () => {
    vi.stubEnv("VAPID_SUBJECT", "secret-invalid-subject");
    mocks.setVapidDetails.mockImplementation(() => { throw new Error("secret-invalid-subject"); });
    await submitRequest();
    expect(console.info).toHaveBeenCalledWith("[push] VAPID configuration diagnostics",
      expect.objectContaining({ subjectFormat: "invalid" }));
    expect(console.error).toHaveBeenCalledWith("Push notification failed",
      expect.objectContaining({ message: "Invalid Web Push VAPID configuration" }));
    expect(mocks.sendNotification).not.toHaveBeenCalled();
  });
});
