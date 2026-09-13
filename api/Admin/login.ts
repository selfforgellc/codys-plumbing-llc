import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createAdminCookie, json, readJson, setCors } from "../_lib";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const input = await readJson(req);
  if (!process.env.ADMIN_PASSWORD || input.password !== process.env.ADMIN_PASSWORD) return json(res, 401, { error: "Invalid password" });
  res.setHeader("Set-Cookie", `cody_admin=${encodeURIComponent(createAdminCookie())}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
  return json(res, 200, { ok: true });
}
