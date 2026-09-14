import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminRequired, json, setCors, supabaseAdmin, type RequestStatus } from "../_lib.js";

const statuses: RequestStatus[] = ["New", "Contacted", "Scheduled", "In Progress", "Completed", "Cancelled"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!adminRequired(req, res)) return;
  if (req.method !== "PATCH") return json(res, 405, { error: "Method not allowed" });
  try {
    const status = req.body?.status;
    if (!statuses.includes(status)) return json(res, 400, { error: "Invalid status" });
    const db = supabaseAdmin();
    const { data, error } = await db.from("service_requests").update({ status }).eq("id", req.query.id).select("*").single();
    if (error) throw error;
    return json(res, 200, { request: data });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: "Unable to update request" });
  }
}
