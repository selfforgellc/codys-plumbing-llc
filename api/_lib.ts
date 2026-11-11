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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
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
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
  } catch {
    // Library validation errors can include configuration values.
    throw new Error("Invalid Web Push VAPID configuration");
  }
  return webpush;
}

function vapidSubjectFormat(subject: string | undefined) {
  if (!subject) return "missing";
  if (/\s/.test(subject)) return "invalid";
  if (/^mailto:[^@/?#<>]+@[^@/?#<>]+$/i.test(subject)) return "mailto";
  if (/^https:\/\//i.test(subject)) {
    try {
      const url = new URL(subject);
      if (url.hostname && !url.username && !url.password) {
        return url.hostname === "localhost" ? "https_localhost" : "https";
      }
    } catch {
      return "invalid";
    }
  }
  return "invalid";
}

function pushRejectionCategory(statusCode: number | undefined, body: unknown) {
  if (statusCode === 401) return "provider_unauthorized";
  if (statusCode === 403) {
    // Match a known FCM response exactly. Provider-controlled text never reaches logs.
    if (typeof body === "string" && body.length <= 256 &&
      body.trim().toLowerCase() ===
        "the vapid credentials in the authorization header do not correspond to the credentials used to create the subscriptions.") {
      return "vapid_subscription_credentials_mismatch";
    }
    return "provider_forbidden";
  }
  if (statusCode === 404 || statusCode === 410) return "subscription_unavailable";
  return statusCode === undefined ? "no_provider_status" : "other_provider_rejection";
}

export async function notifyPush(request: ServiceRequest) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const keyBytes = publicKey ? Buffer.from(publicKey, "base64url") : null;
  console.info("[push] VAPID configuration diagnostics", {
    requestId: request.id,
    subjectFormat: vapidSubjectFormat(process.env.VAPID_SUBJECT),
    configuredKeyFingerprint: keyBytes?.length === 65 && keyBytes[0] === 4
      ? crypto.createHash("sha256").update(keyBytes).digest("hex").slice(0, 12)
      : null,
  });
  const push = configurePush();
  const db = supabaseAdmin();
  const { data, error } = await db.from("push_subscriptions").select("id, subscription");
  if (error) {
    console.error("[push] Unable to load subscriptions", { message: error.message, code: error.code });
    throw error;
  }
  const subscriptions = data || [];
  console.info("[push] Starting notification delivery", {
    requestId: request.id,
    subscriptionCount: subscriptions.length,
  });
  if (subscriptions.length === 0) {
    console.warn("[push] No subscriptions registered; notification not sent", { requestId: request.id });
    return;
  }
  const message = JSON.stringify({
    title: request.is_emergency ? "Emergency plumbing request" : "New plumbing request",
    body: `${request.name} · ${request.city} · ${request.service_type}`,
    requestId: request.id,
    url: `/admin?request=${request.id}`,
  });
  const outcomes = await Promise.all(subscriptions.map(async (row) => {
    try {
      const response = await push.sendNotification(row.subscription, message);
      console.info("[push] Delivery accepted by push service", {
        requestId: request.id,
        statusCode: response.statusCode,
      });
      return "accepted";
    } catch (err: unknown) {
      const failure = typeof err === "object" && err !== null
        ? err as { statusCode?: unknown; body?: unknown } : undefined;
      const status = failure?.statusCode;
      const statusCode = typeof status === "number" && Number.isInteger(status) &&
        status >= 100 && status <= 599 ? status : undefined;
      console.error("[push] Delivery rejected by push service", {
        requestId: request.id,
        statusCode: statusCode ?? null,
        category: pushRejectionCategory(statusCode, failure?.body),
      });
      if (statusCode === 404 || statusCode === 410) {
        const { error: cleanupError } = await db.from("push_subscriptions").delete().eq("id", row.id);
        if (cleanupError) console.error("[push] Failed to remove expired subscription", {
          requestId: request.id,
          code: cleanupError.code,
        });
      }
      return "failed";
    }
  }));
  console.info("[push] Notification delivery summary", {
    requestId: request.id,
    subscriptionCount: subscriptions.length,
    accepted: outcomes.filter((result) => result === "accepted").length,
    failed: outcomes.filter((result) => result === "failed").length,
  });
}

export function validateRequest(input: any) {
  const required = ["name", "phone", "address", "city", "service_type", "description", "preferred_time"];
  for (const field of required) {
    if (typeof input?.[field] !== "string" || input[field].trim().length < 2) return `${field} is required`;
  }
  return null;
}
