# Fly.io Deployment

## Runtime
This repo now deploys as a `Next.js` server app, not the old Flask app.

Use the root-level files:

- `fly.toml`
- `Dockerfile`
- `.dockerignore`

You do not need to pass a custom path to `fly.toml` as long as you run `fly deploy` from the repo root.

## Region
Use `iad` unless you have a strong reason to place it elsewhere.

Why:
- you appear to be US-based
- it is already the configured primary region
- it is a sensible default for browser + Supabase cookie/SSR traffic

## Machine Size
Start with:

- shared CPU: `1`
- memory: `512 MB`

This is enough for a small `Next.js` SSR app using Supabase for auth/data.

If you later see memory pressure or cold-start pain, move to `1 GB` before changing CPU.

## Volumes
Do not create any Fly volumes.

Why:
- this app is stateless
- persistence is handled by Supabase
- Fly volumes are not needed for cookie/SSR session handling

## Secrets and Environment
Do not commit secrets into the repo.

Set these in Fly secrets or Fly environment config:

- `NEXT_PUBLIC_SITE_URL=https://app-winter-fire-9745.fly.dev`
- `CAPACITOR_SERVER_URL=https://app-winter-fire-9745.fly.dev`
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`

Optional App Links placeholders:

- `ANDROID_APP_LINK_PRODUCTION_HOST=app-winter-fire-9745.fly.dev`
- `ANDROID_APP_LINK_STAGING_HOST=staging.example.com`
- `ANDROID_APP_LINK_SHA256_RELEASE=RELEASE_SHA256_FINGERPRINT`
- `ANDROID_APP_LINK_SHA256_DEBUG=DEBUG_SHA256_FINGERPRINT`

Notes:
- `NEXT_PUBLIC_*` values are still safe to expose to the browser as intended
- `SUPABASE_SERVICE_ROLE_KEY` must remain secret
- `.env.local` is ignored by git and excluded from the Docker build context

## What Is Included vs Held Back
Included in deploy/build:
- app code
- public assets
- package manifests
- Next build output generated in Docker

Held back from deploy context:
- `.env.local`
- other `.env.*` files except `.env.example`
- `node_modules`
- `.next`
- Android build outputs
- legacy Flask-related files and migration data that are not needed at runtime

## Fly Commands
From the repo root:

```bash
fly secrets set \
  NEXT_PUBLIC_SITE_URL=https://app-winter-fire-9745.fly.dev \
  CAPACITOR_SERVER_URL=https://app-winter-fire-9745.fly.dev \
  NEXT_PUBLIC_SUPABASE_URL=... \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  SUPABASE_SERVICE_ROLE_KEY=...
```

Then deploy:

```bash
fly deploy
```

## HTTPS / Cookie / SSR Notes
This setup is correct for signed-in persistence using Supabase SSR cookies in a Fly-hosted browser app:

- Fly serves HTTPS
- `force_https = true` is enabled
- the app runs as a stateful server process for SSR
- Supabase auth cookies can be set/read over HTTPS as intended

What you must also do in Supabase:

- set `Site URL` to `https://app-winter-fire-9745.fly.dev`
- add redirect URLs:
  - `https://app-winter-fire-9745.fly.dev/auth/callback`
  - `https://app-winter-fire-9745.fly.dev/auth/reset-password`

## Before Deploying
Check:

```bash
npm run lint
npm run typecheck
npm run build
```
