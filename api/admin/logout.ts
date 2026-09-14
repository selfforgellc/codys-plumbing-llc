import type { VercelRequest, VercelResponse } from "@vercel/node";
import { json, setCors } from "../_lib.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  res.setHeader("Set-Cookie", "cody_admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  return json(res, 200, { ok: true });
}
