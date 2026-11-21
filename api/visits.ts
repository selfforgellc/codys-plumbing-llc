import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminRole, dispatchSameOrigin, json, readJson, supabaseAdmin } from "./_lib.js";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "POST") {
      if (!dispatchSameOrigin(req) || req.headers["sec-fetch-site"] !== "same-origin") {
        return json(res, 403, { error: "Forbidden" });
      }

      const input = await readJson(req, 256).catch(() => null);
      if (typeof input?.id !== "string" || !uuid.test(input.id)) {
        return json(res, 400, { error: "Invalid visit" });
      }

      const { error } = await supabaseAdmin().from("website_visits")
        .upsert({ id: input.id }, { onConflict: "id", ignoreDuplicates: true });
      if (error) throw error;
      return res.status(204).end();
    }

    if (req.method === "GET") {
      if (await adminRole(req) !== "anthony") {
        return json(res, 403, { error: "Forbidden" });
      }

      const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Phoenix" }).format(new Date());
      const startOfToday = new Date(`${day}T00:00:00-07:00`);
      const startOfWeek = new Date(startOfToday.getTime() - 6 * 86400000);
      const visits = supabaseAdmin().from("website_visits");
      const startOfMonth = new Date(startOfToday.getTime() - 29 * 86400000);
      res.setHeader("Cache-Control", "private, no-store");
      const [today, week, month, allTime] = await Promise.all([
        visits.select("id", { count: "exact", head: true }).gte("visited_at", startOfToday.toISOString()),
        visits.select("id", { count: "exact", head: true }).gte("visited_at", startOfWeek.toISOString()),
        visits.select("id", { count: "exact", head: true }).gte("visited_at", startOfMonth.toISOString()),
        visits.select("id", { count: "exact", head: true }),
      ]);
      if (today.error || week.error || month.error || allTime.error) throw today.error ?? week.error ?? month.error ?? allTime.error;
      return json(res, 200, { today: today.count, week: week.count, month: month.count, allTime: allTime.count });
    }

    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed" });
  } catch {
    return json(res, 503, { error: "Website visits are temporarily unavailable" });
  }
}
