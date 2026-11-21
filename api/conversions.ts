import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dispatchSameOrigin, json, readJson, supabaseAdmin } from "./_lib.js";
const allowed = new Set(["phone_click", "booking_open", "booking_success", "booking_error"]);
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return json(res, 405, { error: "Method not allowed" }); }
  if (!dispatchSameOrigin(req) || req.headers["sec-fetch-site"] !== "same-origin") return json(res, 403, { error: "Forbidden" });
  try {
    const body = await readJson(req, 256);
    if (typeof body?.type !== "string" || !allowed.has(body.type)) return json(res, 400, { error: "Invalid event" });
    const { error } = await supabaseAdmin().from("conversion_events").insert({ event_type: body.type });
    if (error) throw error;
    return res.status(204).end();
  } catch (error) {
    console.error("[conversion] Unable to record event", error);
    return json(res, 503, { error: "Tracking unavailable" });
  }
}
