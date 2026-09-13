# Cody's Plumbing Dispatch Deployment

## 1. Supabase

Create a free Supabase project, open **SQL Editor**, and run [`supabase/schema.sql`](./supabase/schema.sql). The app uses the Supabase service role only inside Vercel serverless functions; the service role key must never be exposed to browser code.

## 2. Generate Web Push keys

On any computer with Node.js installed, run:

```bash
npx web-push generate-vapid-keys
```

Save the public and private keys. Use the public key only through `VAPID_PUBLIC_KEY`; keep the private key secret.

## 3. Vercel environment variables

Add these to the Vercel project for **Production**, **Preview**, and **Development** as appropriate:

| Variable | Value | Purpose |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | Server-side database connection |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key | Server-only database access; never use as `VITE_` |
| `ADMIN_PASSWORD` | A long unique password | Protects `/admin` and request APIs |
| `VAPID_SUBJECT` | `mailto:owner@example.com` | Web Push contact identity; replace with Cody's email |
| `VAPID_PUBLIC_KEY` | Generated VAPID public key | Browser push subscription |
| `VAPID_PRIVATE_KEY` | Generated VAPID private key | Server-side push signing |
| `PUBLIC_SITE_URL` | `https://your-production-domain.com` | CORS allowlist for API calls |

Never commit `.env`, `.env.local`, Supabase service keys, the admin password, or the VAPID private key.

## 4. Vercel deployment

Import the repository into Vercel, select the project root, and use the existing `vercel.json`. Vercel will build the Vite frontend and deploy the `api/` directory as Node.js serverless functions. After deployment, test:

- `https://your-domain.com/` — public website
- `https://your-domain.com/admin` — protected dashboard
- `https://your-domain.com/api/push/config` — should return a public key, not an error

## 5. Android notifications

1. Open the production `/admin` URL in **Chrome on Cody's Android phone**.
2. Sign in with `ADMIN_PASSWORD`.
3. Tap **Enable notifications** and choose **Allow** when Chrome asks.
4. Keep the dashboard installed/open as a PWA if desired: Chrome menu → **Add to Home screen**.
5. Submit a test request from another phone or browser. Cody should receive a notification; tapping it opens `/admin?request=<id>` and highlights the request.

Web Push cannot deliver while notification permission is denied, the subscription is deleted, or VAPID/Supabase environment variables are missing. The dashboard's **Enable notifications** button can be used again to re-register the device.

## 6. Run the smoke test

Copy the Vercel environment variables into a local `.env.local` file, then run:

```bash
npm install
npm run test:dispatch
```

The script checks the Supabase connection, push-subscription table, deployed push configuration, admin authentication, protected request API, and push subscription endpoint. If Cody has already enabled notifications, it sends a real test push notification to the saved device(s). It does not create a fake customer request. Confirm the notification appears on Cody's Android phone.
