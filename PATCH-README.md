# Cody's Plumbing dispatch-system patch

This folder contains only files that were added or changed compared with the uploaded GitHub ZIP.

To apply it, extract this ZIP into the root of the existing `codys-plumbing-llc-main` repository and allow files to overwrite. No existing files need to be deleted. Commit the result and deploy to Vercel.

Added files create the Supabase/Vercel APIs, protected dashboard, PWA service worker, Web Push support, database schema, deployment instructions, and smoke test.

Changed files replace the SMS form, register the admin route/PWA manifest, add serverless dependencies/lockfile entries, and include API files in TypeScript checking.

Before production use, run `supabase/schema.sql` in Supabase and add the environment variables listed in `DEPLOYMENT.md`.
