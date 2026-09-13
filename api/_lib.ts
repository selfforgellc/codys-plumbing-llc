import crypto from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export type RequestStatus = "New" | "Contacted" | "Scheduled" | "In Progress" | "Completed" | "Cancelled";

export type ServiceRequest = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  service_type: string;
  description: string;
  is_emergency: boolean;
  preferred_time: string;
  status: RequestStatus;
};

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export async function readJson(req: IncomingMessage) {
  let body = "";
  for await (const chunk of req) body += chunk;
  if (!body) return {};
  return JSON.parse(body);
}

export function setCors(res: ServerResponse) {
  const origin = process.env.PUBLIC_SITE_URL || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Password");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
}

function secret() {
  return process.env.ADMIN_PASSWORD || "";
}

function signature(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function createAdminCookie() {
  const value = "cody-admin";
  return `${value}.${signature(value)}`;
}

export function isAdmin(req: IncomingMessage) {
  const cookieHeader = String(req.headers.cookie || "");
  const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith("cody_admin="));
  if (!cookie || !secret()) return false;
  const token = decodeURIComponent(cookie.split("=").slice(1).join("="));
  const [value, sig] = token.split(".");
  const expected = signature(value || "");
  return value === "cody-admin" && Boolean(sig) && sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export function adminRequired(req: IncomingMessage, res: ServerResponse) {
  if (isAdmin(req)) return true;
  json(res, 401, { error: "Unauthorized" });
  return false;
}

export function configurePush() {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) throw new Error("Missing VAPID_SUBJECT, VAPID_PUBLIC_KEY, or VAPID_PRIVATE_KEY");
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}

export async function notifyPush(request: ServiceRequest) {
  const push = configurePush();
  const db = supabaseAdmin();
  const { data, error } = await db.from("push_subscriptions").select("id, subscription");
  if (error) throw error;
  const message = JSON.stringify({
    title: request.is_emergency ? "Emergency plumbing request" : "New plumbing request",
    body: `${request.name} · ${request.city} · ${request.service_type}`,
    requestId: request.id,
    url: `/admin?request=${request.id}`,
  });
  await Promise.all((data || []).map(async (row) => {
    try {
      await push.sendNotification(row.subscription, message);
    } catch (error: any) {
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await db.from("push_subscriptions").delete().eq("id", row.id);
      }
    }
  }));
}

export function validateRequest(input: any) {
  const required = ["name", "phone", "address", "city", "service_type", "description", "preferred_time"];
  for (const field of required) {
    if (typeof input?.[field] !== "string" || input[field].trim().length < 2) return `${field} is required`;
  }
  return null;
}
