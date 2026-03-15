# Digital Business Card

Astro + Vercel project that preserves the current landing page design and adds a backend-ready contact flow.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Contact backend

The `Message` action posts to `/api/contact`.

If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured, submissions are stored in Supabase.

If backend storage is not configured, the UI falls back to `mailto:` using `PUBLIC_CONTACT_EMAIL`.

## Environment variables

Copy `.env.example` to `.env` and fill in:

```bash
PUBLIC_SITE_URL=https://your-domain.com
PUBLIC_CONTACT_EMAIL=life@uos.ac.kr
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_CONTACT_TABLE=contact_messages
```

## Supabase setup

Run:

```sql
\i supabase/contact_messages.sql
```

Or paste the SQL file contents into the Supabase SQL editor.

## Deploy

1. Push this folder to a Git repository.
2. Import the repo into Vercel.
3. Add the environment variables in Vercel Project Settings.
4. Deploy.
