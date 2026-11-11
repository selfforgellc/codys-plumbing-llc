import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dispatchAccountAction, dispatchAccountsEnabled, dispatchCookie, dispatchSameOrigin, dispatchSession, json, setCors } from "../_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (dispatchAccountsEnabled()) {
    if (!dispatchSameOrigin(req)) return json(res, 403, { error: "Forbidden" });
    const token = dispatchSession(req);
    try {
      if (token) await dispatchAccountAction("logout", { token });
    } catch {
      return json(res, 503, { error: "Could not sign out. Try again." });
    }
  }
  res.setHeader("Set-Cookie", [dispatchCookie(""), "cody_admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"]);
  return json(res, 200, { ok: true });
}

