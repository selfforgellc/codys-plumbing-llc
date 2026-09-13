import type { VercelRequest, VercelResponse } from "@vercel/node";
import { json, setCors } from "../_lib";

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  if (!process.env.VAPID_PUBLIC_KEY) return json(res, 503, { error: "Push notifications are not configured" });
  return json(res, 200, { publicKey: process.env.VAPID_PUBLIC_KEY });
}
