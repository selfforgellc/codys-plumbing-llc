import { createHash, randomBytes } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminRole, dispatchSameOrigin, json, readJson, sameSecret, supabaseAdmin } from "../_lib.js";
import { hashPassword } from "./_password.js";

function recoveryHash(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!dispatchSameOrigin(req)) return json(res, 403, { error: "Forbidden" });

  const input = await readJson(req, 4096).catch(() => null);
  try {
    const db = supabaseAdmin();
    if (input?.action === "issue") {
      if (await adminRole(req) !== "anthony") return json(res, 403, { error: "Sign in with Anthony’s access code." });
      const code = randomBytes(16).toString("base64url");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const { error } = await db.from("dispatch_recovery").upsert({
        singleton: true, code_hash: recoveryHash(code), expires_at: expiresAt,
      });
      if (error) throw error;
      return json(res, 200, { code });
    }

    if (input?.action !== "reset") return json(res, 400, { error: "Invalid recovery action." });
    const { code, newPassword } = input;
    if (typeof code !== "string" || !/^[A-Za-z0-9_-]{22}$/.test(code.trim())) {
      return json(res, 400, { error: "Enter the reset code Anthony gave you." });
    }
    if (typeof newPassword !== "string" || newPassword.length < 12 || newPassword.length > 128 || !newPassword.trim()) {
      return json(res, 400, { error: "Choose a new password of 12–128 characters." });
    }
    if ([process.env.ADMIN_PASSWORD, process.env.DISPATCH_ACCESS_CODE].some(
      (value) => value && sameSecret(newPassword, value),
    )) {
      return json(res, 400, { error: "Choose a different new password." });
    }

    const hash = recoveryHash(code.trim());
    const { data: active, error: lookupError } = await db.from("dispatch_recovery")
      .select("singleton").eq("code_hash", hash).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (lookupError) throw lookupError;
    if (!active) return json(res, 401, { error: "That code is invalid, expired, or already used." });

    const { data: reset, error } = await db.rpc("reset_dispatch_password", {
      recovery_hash: hash, replacement_hash: await hashPassword(newPassword),
    });
    if (error) throw error;
    if (!reset) return json(res, 401, { error: "That code is invalid, expired, or already used." });
    return json(res, 200, { ok: true });
  } catch {
    return json(res, 503, { error: "Password recovery is temporarily unavailable. Try again." });
  }
}
