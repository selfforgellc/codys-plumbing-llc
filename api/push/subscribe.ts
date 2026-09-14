import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminRequired, json, readJson, setCors, supabaseAdmin } from "../_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!adminRequired(req, res)) return;
  try {
    const input = await readJson(req);
    if (!input?.endpoint || !input?.keys) return json(res, 400, { error: "Invalid push subscription" });
    const db = supabaseAdmin();
    const { error } = await db.from("push_subscriptions").upsert({ endpoint: input.endpoint, subscription: input }, { onConflict: "endpoint" });
    if (error) throw error;
    return json(res, 201, { ok: true });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: "Unable to save push subscription" });
  }
}
