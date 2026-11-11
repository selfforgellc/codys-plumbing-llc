import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminRole, codyPasswordHash, createAdminCookie, json, readJson, sameSecret, setCors } from "../_lib.js";
import { matchesCodyPassword } from "./_password.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    if (req.method === "GET") {
      const role = await adminRole(req);
      return role ? json(res, 200, { canChangePassword: role === "cody" }) : json(res, 401, { error: "Unauthorized" });
    }
    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
    const input = await readJson(req, 4096).catch(() => null);
    if (typeof input?.password !== "string") return json(res, 400, { error: "Enter your password." });
    const accessCode = process.env.DISPATCH_ACCESS_CODE;
    if (accessCode && sameSecret(input.password, accessCode)) {
      res.setHeader("Set-Cookie", createAdminCookie("anthony", accessCode));
      return json(res, 200, { ok: true, canChangePassword: false });
    }
    const hash = await codyPasswordHash();
    const key = hash ?? process.env.ADMIN_PASSWORD;
    if (!key || !(await matchesCodyPassword(input.password, hash))) {
      return json(res, 401, { error: "Invalid password or access code." });
    }
    res.setHeader("Set-Cookie", createAdminCookie("cody", key));
    return json(res, 200, { ok: true, canChangePassword: true });
  } catch {
    return json(res, 503, { error: "Dispatch sign-in is temporarily unavailable." });
  }
}
