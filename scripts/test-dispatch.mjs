#!/usr/bin/env node

/**
 * Cody's Plumbing production smoke test.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-dispatch.mjs
 *
 * It does not create a customer request. It checks database access, deployed
 * API/auth/push configuration, and sends a test notification to every saved
 * push subscription. The notification must still be confirmed on Cody's phone.
 */
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_PASSWORD",
  "VAPID_SUBJECT",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) fail(`Missing environment variables: ${missing.join(", ")}`);

const baseUrl = (process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

let passed = 0;
async function check(label, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS  ${label}`);
  } catch (error) {
    console.error(`FAIL  ${label}\n      ${error?.message || error}`);
    process.exitCode = 1;
  }
}
function fail(message) { console.error(`ERROR ${message}`); process.exit(1); }
function assert(condition, message) { if (!condition) throw new Error(message); }

await check("Supabase service-role connection", async () => {
  const { error } = await db.from("service_requests").select("id", { count: "exact", head: true });
  if (error) throw error;
});

let subscriptions = [];
await check("Supabase push_subscriptions table", async () => {
  const result = await db.from("push_subscriptions").select("id, endpoint, subscription");
  if (result.error) throw result.error;
  subscriptions = result.data || [];
  console.log(`      ${subscriptions.length} saved subscription(s)`);
});

if (baseUrl) {
  let cookie = "";
  await check("Deployed push configuration endpoint", async () => {
    const response = await fetch(`${baseUrl}/api/push/config`);
    const body = await response.json();
    assert(response.ok && body.publicKey === process.env.VAPID_PUBLIC_KEY, "Public VAPID key does not match the deployed API");
  });

  await check("Admin authentication and protected request API", async () => {
    const response = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
    });
    const body = await response.json();
    assert(response.ok && body.ok, body.error || "Admin login failed");
    cookie = response.headers.get("set-cookie")?.split(";")[0];
    assert(cookie, "Login succeeded but no session cookie was returned");
    const requests = await fetch(`${baseUrl}/api/requests`, { headers: { Cookie: cookie } });
    assert(requests.ok, `Protected requests API returned HTTP ${requests.status}`);
  });

  await check("Admin push subscription endpoint", async () => {
    assert(cookie, "No admin session cookie available");
    const response = await fetch(`${baseUrl}/api/push/subscribe`, {
      method: "POST", headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: "https://test.invalid/smoke-test", keys: { p256dh: "smoke-test", auth: "smoke-test" } }),
    });
    // The intentionally invalid endpoint may be rejected by Supabase later; a 201
    // proves auth/routing/database write path, then we delete it immediately.
    assert(response.status === 201, `Subscription API returned HTTP ${response.status}`);
    await db.from("push_subscriptions").delete().eq("endpoint", "https://test.invalid/smoke-test");
  });
} else {
  console.log("SKIP  Deployed API checks (PUBLIC_SITE_URL is not set)");
}

if (subscriptions.length === 0) {
  console.log("SKIP  Push delivery (no Android/browser subscription is saved yet)");
} else {
  let delivered = 0;
  for (const row of subscriptions) {
    try {
      await webpush.sendNotification(row.subscription, JSON.stringify({
        title: "Cody's Plumbing test notification",
        body: "Push notifications are connected correctly.",
        url: "/admin",
        requestId: "push-smoke-test",
      }));
      delivered += 1;
    } catch (error) {
      console.error(`      Push failed for ${row.endpoint.slice(0, 60)}…: ${error?.statusCode || error?.message || error}`);
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await db.from("push_subscriptions").delete().eq("id", row.id);
      }
    }
  }
  await check("Web Push delivery request", async () => {
    assert(delivered > 0, "No push subscription accepted the notification");
    console.log(`      ${delivered}/${subscriptions.length} push request(s) accepted`);
  });
  console.log("      Confirm the notification appeared on Cody's Android phone.");
}

console.log(`\n${passed} check(s) passed.`);
if (process.exitCode) console.log("One or more checks failed. Review the error above.");
