# Welsh Vocabulary Practice

Phase 1 foundation for the Welsh vocabulary flashcards rewrite.

## Stack
- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS
- Supabase (Postgres/Auth/RLS)
- Capacitor Android

## Environment variables
Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public anon key for browser and server session clients
- `SUPABASE_SERVICE_ROLE_KEY`: service role key for admin-only scripts such as the legacy import

## Local development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create local environment config:
   ```bash
   cp .env.example .env.local
   ```
3. Start the Next.js app:
   ```bash
   npm run dev
   ```

## Database schema and migrations
Schema migrations live in `supabase/migrations`.

Recommended migration workflow with the Supabase CLI installed:

```bash
supabase db push
```

For a local reset:

```bash
supabase db reset
```

Generated TypeScript database types live in `types/database.ts` and should be kept aligned with the schema.

## Legacy JSON import
The legacy dataset source is `data.json`.

Generate seed artifacts from the legacy JSON:

```bash
npm run db:legacy:generate
```

This writes:
- `supabase/seed/legacy-words.json`
- `supabase/seed/legacy-seed.sql`

Apply the legacy dataset directly to Supabase with an explicit wipe-and-reseed flow:

```bash
npm run db:legacy:apply
```

That command requires `SUPABASE_SERVICE_ROLE_KEY` and intentionally runs with `--apply --wipe` so the import is deterministic and does not duplicate words.

## Next.js build
Create the production web build:

```bash
npm run build:web
```

The app is configured with static export output so the build artifacts are written to `out/`, which matches the Capacitor web directory.

## Capacitor Android
Android platform files live in `android/`, with config in `capacitor.config.ts`.

Build the web bundle and sync it into Android:

```bash
npm run build:web
npm run cap:sync:android
```

Open the Android project:

```bash
npm run cap:open:android
```

## Validation
Run the standard checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Legacy app
The previous Flask implementation remains in `/legacy` for reference-only migration context.
