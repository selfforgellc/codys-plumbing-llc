import { createHash } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import account from "../api/admin/account";
import login from "../api/admin/login";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ rpc }) }));

async function post(handler: typeof account, payload: unknown, origin = "https://dispatch.example") {
  const req = {
    method: "POST", headers: { host: "dispatch.example", origin },
    async *[Symbol.asyncIterator]() { yield JSON.stringify(payload); },
  } as Parameters<typeof handler>[0];
  const res = { statusCode: 0, setHeader: vi.fn(), end: vi.fn() };
  await handler(req, res as unknown as Parameters<typeof handler>[1]);
  return res;
}

afterEach(() => { vi.unstubAllEnvs(); rpc.mockReset(); });

function enableAccounts(mode = "enabled") {
  vi.stubEnv("DISPATCH_ACCOUNTS_MODE", mode);
  vi.stubEnv("SUPABASE_URL", "https://database.example");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-only");
}

it("issues exactly three unique setup recovery codes and stores only their hashes", async () => {
  enableAccounts();
  rpc.mockResolvedValue({ data: "ok" });
  const res = await post(account, {
    action: "setup", username: "cody", credential: "a".repeat(22), password: "fixture password",
  });
  expect(res.statusCode).toBe(200);
  const { recoveryCodes } = JSON.parse(res.end.mock.calls[0][0]);
  expect(new Set(recoveryCodes).size).toBe(3);
  expect(rpc).toHaveBeenCalledWith("dispatch_account_action", expect.objectContaining({
    action: "setup",
    account_name: "cody",
    new_recovery_hashes: recoveryCodes.map((code: string) => createHash("sha256").update(code).digest("hex")),
  }));
});

it("blocks cross-origin account recovery before touching the database", async () => {
  enableAccounts();
  expect((await post(account, {}, "https://other.example")).statusCode).toBe(403);
  expect(rpc).not.toHaveBeenCalled();
});

it.each([true, false])("sets the expected cookie lifetime when remember is %s", async (remember) => {
  enableAccounts();
  rpc.mockResolvedValue({ data: "ok" });
  const res = await post(login, { username: "anthony", password: "fixture password", remember });
  expect(res.statusCode).toBe(200);
  const cookie = res.setHeader.mock.calls.find(([name]) => name === "Set-Cookie")?.[1];
  expect(cookie).toContain("HttpOnly; Secure; SameSite=Strict");
  expect(cookie.includes("Max-Age=2592000")).toBe(remember);
});

it("keeps the shared login in setup mode and retires it when accounts are enabled", async () => {
  enableAccounts("setup");
  vi.stubEnv("ADMIN_PASSWORD", "legacy test password");
  expect((await post(login, { password: "legacy test password" })).statusCode).toBe(200);
  enableAccounts();
  expect((await post(login, { password: "legacy test password" })).statusCode).toBe(401);
  expect(rpc).not.toHaveBeenCalled();
});

