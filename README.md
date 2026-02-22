# AI 10 Workshop — Progress & Portfolio

Track your progress through the 10-week AI workshop, keep notes and portfolio links, and share with your team so you can follow each other’s progress.

## Features

- **10 week cards** — Completion checkboxes, notes, and links per week
- **Progress bar** — Overall completion (X/10 weeks, %)
- **User accounts** — Sign up / sign in with email (Supabase Auth)
- **Cloud sync** — Progress is stored in Supabase and available on any device
- **Teams** — Create a team or join with an invite code; see teammates’ progress (e.g. “3/10 weeks”) in the Team panel

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is enough)

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com) → New project.

2. In the SQL Editor, run the migration that creates tables and RLS:
   - Open `supabase/migrations/001_initial.sql` in this repo.
   - Copy its contents and run it in the Supabase SQL Editor (Run).

3. Get your API keys:
   - In the Supabase dashboard: click the **gear icon** (bottom left) → **Project Settings** → **API**.
   - Copy **Project URL** and the **anon** **public** key.
   - **Detailed steps with screenshots description:** see [docs/SETUP-AND-DEPLOY.md](docs/SETUP-AND-DEPLOY.md) for Step 3 (keys) and Step 4 (deploy to Vercel or Netlify).

4. (Optional) In Authentication → Providers, you can disable “Confirm email” if you want to test without email verification. For production, leave it on.

## Run locally

1. Copy env example and set your keys:

```bash
cp .env.example .env
```

Edit `.env` and set:

- `VITE_SUPABASE_URL` — your Project URL  
- `VITE_SUPABASE_ANON_KEY` — your anon public key  

2. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign up with an email and password, then use the app. Create a team to get an invite code; share the code so others can join and you’ll see their progress in the Team panel.

## Build

```bash
npm run build
```

Output is in `dist/`. Preview with:

```bash
npm run preview
```

## Deploy online

The app is static (Vite build). Deploy the `dist/` folder and set the same env vars so the deployed app talks to your Supabase project.

### Vercel

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. In Project Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redeploy so the build picks up the variables.

### Netlify

1. Add the site from Git; build command: `npm run build`, publish directory: `dist`.
2. Site settings → Environment variables: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Trigger a new deploy.

---

If you don’t set the Supabase env vars, the app still runs: progress is stored only in the browser (localStorage) and there is no sign-in or team features.
