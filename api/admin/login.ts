import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomBytes } from "node:crypto";
import { createAdminCookie, dispatchAccountAction, dispatchAccountsEnabled, dispatchCookie, dispatchLegacyLoginEnabled, dispatchSameOrigin, json, readJson, setCors } from "../_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") return json(res, 200, { accounts: dispatchAccountsEnabled(), legacy: dispatchLegacyLoginEnabled() });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const input = await readJson(req, 4096).catch(() => null);
  if (!input || typeof input.password !== "string") return json(res, 400, { error: "Enter your password." });
  const username = typeof input.username === "string" ? input.username.trim().toLowerCase() : "";
  if (dispatchAccountsEnabled() && (username || !dispatchLegacyLoginEnabled())) {
    if (!dispatchSameOrigin(req)) return json(res, 403, { error: "Forbidden" });
    if (!["cody", "anthony"].includes(username) || Buffer.byteLength(input.password) > 72 || input.password.includes("\0")) {
      return json(res, 401, { error: "Invalid username or password." });
    }
    const token = randomBytes(32).toString("base64url");
    const remember = input.remember === true;
    try {
      const result = await dispatchAccountAction("login", { username, credential: input.password, token, remember });
      if (result === "limited") return json(res, 429, { error: "Too many attempts. Try again in 15 minutes." });
      if (result !== "ok") return json(res, 401, { error: "Invalid username or password." });
      res.setHeader("Set-Cookie", dispatchCookie(token, remember));
      return json(res, 200, { ok: true });
    } catch {
      return json(res, 503, { error: "Dispatch sign-in is temporarily unavailable." });
    }
  }
  if (!process.env.ADMIN_PASSWORD || input.password !== process.env.ADMIN_PASSWORD) return json(res, 401, { error: "Invalid password" });
  res.setHeader("Set-Cookie", `cody_admin=${encodeURIComponent(createAdminCookie())}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
  return json(res, 200, { ok: true });
}

