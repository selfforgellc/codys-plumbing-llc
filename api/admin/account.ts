import { randomBytes } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dispatchAccountAction, dispatchAccountsEnabled, dispatchCookie, dispatchHash, dispatchSameOrigin, dispatchSession, json, readJson, setCors } from "../_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!dispatchAccountsEnabled()) return json(res, 404, { error: "Account setup is unavailable." });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!dispatchSameOrigin(req)) return json(res, 403, { error: "Forbidden" });
  const input = await readJson(req, 4096).catch(() => null);
  const action = input?.action;
  if (action !== "setup" && action !== "recover" && action !== "change") {
    return json(res, 400, { error: "Invalid account action." });
  }
  const password = input.password;
  if (typeof password !== "string" || password.length < 12 || Buffer.byteLength(password) > 72 || password.includes("\0")) {
    return json(res, 400, { error: "Use a password of at least 12 characters and no more than 72 bytes." });
  }
  const username = typeof input.username === "string" ? input.username.trim().toLowerCase() : "";
  const credential = typeof input.credential === "string" ? input.credential : "";
  const token = dispatchSession(req);
  if (action === "change" && !token) return json(res, 401, { error: "Sign in again to change your password." });
  if (action !== "change" && (!["cody", "anthony"].includes(username) || !/^[A-Za-z0-9_-]{22}$/.test(credential.trim()))) {
    return json(res, 400, { error: "Check your username and code." });
  }
  if (action === "change" && (!credential || Buffer.byteLength(credential) > 72 || credential.includes("\0"))) {
    return json(res, 400, { error: "Enter your current password." });
  }
  const recoveryCodes = action === "setup" ? Array.from({ length: 3 }, () => randomBytes(16).toString("base64url")) : [];
  try {
    const result = await dispatchAccountAction(action, {
      username, credential: action === "change" ? credential : dispatchHash(credential.trim()),
      password, token, recoveryHashes: recoveryCodes.map(dispatchHash),
    });
    if (result === "limited") return json(res, 429, { error: "Too many attempts. Try again in 15 minutes." });
    if (result !== "ok") return json(res, 401, { error: action === "change" ? "Check your current password." : "That code is invalid, expired, or already used." });
    res.setHeader("Set-Cookie", dispatchCookie(""));
    return json(res, 200, { ok: true, recoveryCodes });
  } catch {
    return json(res, 503, { error: "Dispatch account service is temporarily unavailable." });
  }
}

