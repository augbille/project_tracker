# Project Share

Share projects with your team — like Strava, but for projects instead of workouts.

## Features

- **Activity feed** — See projects shared by your teammates
- **My Projects** — Track and share your own projects with name, description, and link
- **Teams** — Create a team or join with an invite code; share projects to teams
- **Strava-inspired design** — Clean, athletic aesthetic with orange accent on dark

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is enough)

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com) → New project.

2. In the SQL Editor, run the migrations in order:
   - `supabase/migrations/001_initial.sql` — profiles, teams, team_members, user_progress
   - `supabase/migrations/003_backfill_profiles.sql` — backfill helper
   - `supabase/migrations/004_projects.sql` — projects table

3. Get your API keys:
   - In the Supabase dashboard: **Project Settings** → **API**
   - Copy **Project URL** and the **anon** **public** key

4. (Optional) In Authentication → Providers, disable "Confirm email" for quick local testing.

## Run locally

1. Copy env example and set your keys:

```bash
cp .env.example .env
```

Edit `.env`:

- `VITE_SUPABASE_URL` — your Project URL
- `VITE_SUPABASE_ANON_KEY` — your anon public key

2. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign up, create a team, share your first project.

## Build

```bash
npm run build
```

Output is in `dist/`. Preview with `npm run preview`.

## Deploy

Deploy the `dist/` folder (Vercel, Netlify, etc.) and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.
