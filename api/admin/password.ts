import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminRole, codyPasswordHash, createAdminCookie, dispatchSameOrigin, json, readJson, sameSecret, supabaseAdmin } from "../_lib.js";
import { hashPassword, matchesCodyPassword } from "./_password.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!dispatchSameOrigin(req)) return json(res, 403, { error: "Forbidden" });

  try {
    if (await adminRole(req) !== "cody") return json(res, 403, { error: "Sign in with Cody’s password to change it." });
    const input = await readJson(req, 4096).catch(() => null);
    const { currentPassword, newPassword } = input ?? {};
    if (typeof currentPassword !== "string" || typeof newPassword !== "string" ||
        newPassword.length < 12 || newPassword.length > 128 || !newPassword.trim()) {
      return json(res, 400, { error: "Enter your current password and a new password of 12–128 characters." });
    }
    if ([currentPassword, process.env.DISPATCH_ACCESS_CODE, process.env.ADMIN_PASSWORD].some(
      (value) => value && sameSecret(newPassword, value),
    )) {
      return json(res, 400, { error: "Choose a different new password." });
    }
    const previousHash = await codyPasswordHash();
    if (!(await matchesCodyPassword(currentPassword, previousHash))) {
      return json(res, 401, { error: "Check your current password." });
    }

    const passwordHash = await hashPassword(newPassword);
    const db = supabaseAdmin().from("dispatch_password");
    const { data, error } = previousHash
      ? await db.update({ password_hash: passwordHash }).eq("singleton", true)
        .eq("password_hash", previousHash).select("singleton").maybeSingle()
      : await db.upsert({ singleton: true, password_hash: passwordHash }, { ignoreDuplicates: true })
        .select("singleton").maybeSingle();
    if (error) throw error;
    if (!data) return json(res, 409, { error: "The password changed. Sign in again and retry." });

    res.setHeader("Set-Cookie", createAdminCookie("cody", passwordHash));
    return json(res, 200, { ok: true });
  } catch {
    return json(res, 503, { error: "Could not change the password. Try again." });
  }
}
