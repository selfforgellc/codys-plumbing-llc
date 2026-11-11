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

export async function readJson(req: IncomingMessage, maxBytes = Infinity) {
  let body = "";
  let bytes = 0;
  for await (const chunk of req) {
    bytes += Buffer.byteLength(chunk);
    if (bytes > maxBytes) throw new Error("Request body too large");
    body += chunk;
  }
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

export function dispatchAccountsEnabled() {
  return process.env.DISPATCH_ACCOUNTS_MODE === "setup" || process.env.DISPATCH_ACCOUNTS_MODE === "enabled";
}

export function dispatchLegacyLoginEnabled() {
  return process.env.DISPATCH_ACCOUNTS_MODE !== "enabled";
}

export function dispatchHash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function dispatchSession(req: IncomingMessage) {
  return /(?:^|;\s*)cody_dispatch=([A-Za-z0-9_-]{43})(?=;|$)/.exec(req.headers.cookie || "")?.[1];
}

export function dispatchCookie(token: string, remember?: boolean) {
  const age = !token ? "; Max-Age=0" : remember ? "; Max-Age=2592000" : "";
  return `cody_dispatch=${token}; Path=/; HttpOnly; Secure; SameSite=Strict${age}`;
}

export async function dispatchAccountAction(action: string, args: {
  username?: string; credential?: string; password?: string; token?: string;
  remember?: boolean; recoveryHashes?: string[];
} = {}) {
  const { data, error } = await supabaseAdmin().rpc("dispatch_account_action", {
    action, account_name: args.username ?? null, credential: args.credential ?? null,
    new_password: args.password ?? null, session_hash: args.token ? dispatchHash(args.token) : null,
    remember_device: args.remember ?? false, new_recovery_hashes: args.recoveryHashes ?? null,
  });
  if (error) throw new Error("Dispatch account service unavailable");
  return data;
}

export function dispatchSameOrigin(req: IncomingMessage) {
  return Boolean(req.headers.host && req.headers.origin === `https://${req.headers.host}`);
}

export async function adminRequired(req: IncomingMessage, res: ServerResponse) {
  if (dispatchAccountsEnabled()) {
    if (req.method !== "GET" && !dispatchSameOrigin(req)) {
      json(res, 403, { error: "Forbidden" });
      return false;
    }
    const token = dispatchSession(req);
    try {
      if (token && ["cody", "anthony"].includes(await dispatchAccountAction("session", { token }))) return true;
    } catch {
      json(res, 503, { error: "Dispatch sign-in is temporarily unavailable" });
      return false;
    }
  }
  if (dispatchLegacyLoginEnabled() && isAdmin(req)) return true;
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
      const statusCode = typeof err === "object" && err !== null && "statusCode" in err
        ? (err as { statusCode?: number }).statusCode : undefined;
      console.error("[push] Delivery rejected by push service", {
        requestId: request.id,
        statusCode: statusCode ?? null,
        // Do not log push endpoints, subscription tokens, keys, payloads or provider response bodies.
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

