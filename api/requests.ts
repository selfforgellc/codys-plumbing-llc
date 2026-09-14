import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminRequired, json, notifyPush, readJson, setCors, supabaseAdmin, validateRequest } from "./_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const db = supabaseAdmin();
    if (req.method === "POST") {
      const input = await readJson(req);
      const validationError = validateRequest(input);
      if (validationError) return json(res, 400, { error: validationError });
      const { data, error } = await db.from("service_requests").insert({
        name: input.name.trim(), phone: input.phone.trim(), address: input.address.trim(), city: input.city.trim(),
        service_type: input.service_type.trim(), description: input.description.trim(), is_emergency: Boolean(input.is_emergency),
        preferred_time: input.preferred_time.trim(), status: "New",
      }).select("*").single();
      if (error) throw error;
      try { await notifyPush(data); } catch (pushError) { console.error("Push notification failed", pushError); }
      return json(res, 201, { request: data });
    }
    if (req.method === "GET") {
      if (!adminRequired(req, res)) return;
      const { data, error } = await db.from("service_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return json(res, 200, { requests: data || [] });
    }
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: "Unable to process request" });
  }
}
