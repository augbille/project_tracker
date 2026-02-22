# Step-by-step: Get Supabase keys & deploy your app

Follow these in order. You need a Supabase project first (step 1–2 from the main README: create project, run the SQL migration). Then:

---

## Step 3: Get your Supabase API keys

1. Open your project on [supabase.com](https://supabase.com) and make sure you’re in the right project.

2. In the **left sidebar**, click the **gear icon** (⚙️) at the bottom. That opens **Project Settings**.

3. In the left menu of Project Settings, click **API**.

4. On the API page you’ll see:
   - **Project URL** — something like `https://abcdefghijk.supabase.co`
   - **Project API keys** — a list that includes:
     - **anon** **public** — a long string starting with `eyJ...`

5. Copy both:
   - **Project URL** → you’ll use this as `VITE_SUPABASE_URL`
   - **anon public** key → you’ll use this as `VITE_SUPABASE_ANON_KEY`

   Keep these somewhere safe (e.g. a note). You’ll paste them into Vercel or Netlify in Step 4.

---

## Step 4: Deploy the app (choose one)

Your app is a static site. You’ll deploy the built files and tell the host your build command and env vars.

### Option A: Deploy with Vercel

1. **Push your code to GitHub** (if you haven’t):
   - Create a new repo on GitHub.
   - In your project folder run:
     ```bash
     git init
     git add .
     git commit -m "AI 10 Workshop app"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
     git push -u origin main
     ```
   - Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.

2. **Import the project on Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
   - Click **Add New…** → **Project**.
   - **Import** the GitHub repo you just pushed.
   - Leave **Framework Preset** as **Vite** (or “Other” is fine).
   - **Build Command**: leave as `npm run build` (or set it to `npm run build`).
   - **Output Directory**: leave as `dist` (or set it to `dist`).
   - Do **not** click Deploy yet.

3. **Add environment variables**:
   - On the same page, open the **Environment Variables** section.
   - Add two variables (one by one):

     | Name                      | Value                          |
     |---------------------------|--------------------------------|
     | `VITE_SUPABASE_URL`       | paste your **Project URL**     |
     | `VITE_SUPABASE_ANON_KEY`  | paste your **anon public** key |

   - For each one: enter the **Name**, paste the **Value**, then click **Add** (or Save).
   - Leave the environment as **Production** (or add the same for Preview if you want).

4. Click **Deploy**. Wait for the build to finish.

5. When it’s done, Vercel shows a URL like `https://your-project.vercel.app`. Open it: you should see the app. Sign up with an email and test.

---

### Option B: Deploy with Netlify

1. **Push your code to GitHub** (same as in Option A, steps 1–2).

2. **Add the site on Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign in (e.g. with GitHub).
   - Click **Add new site** → **Import an existing project**.
   - Choose **GitHub** and pick the repo you pushed.
   - Configure the build:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   - Do **not** click **Deploy site** yet.

3. **Add environment variables**:
   - Open **Site configuration** (or **Site settings**) → **Environment variables** (or **Build & deploy** → **Environment**).
   - Click **Add a variable** or **New variable**.
   - Add:
     - Key: `VITE_SUPABASE_URL`   → Value: your **Project URL**
     - Key: `VITE_SUPABASE_ANON_KEY` → Value: your **anon public** key
   - Save.

4. Trigger a **Deploy** (e.g. **Deploy site** or **Trigger deploy**).

5. When the deploy finishes, Netlify gives you a URL like `https://something.netlify.app`. Open it and test the app.

---

## Quick reference

| What you need        | Where to get it (Supabase)     |
|----------------------|---------------------------------|
| Project URL          | Project Settings → API → **Project URL** |
| Anon public key      | Project Settings → API → **anon public** |

| Where you use them   | Name to set                    |
|----------------------|---------------------------------|
| Vercel / Netlify env | `VITE_SUPABASE_URL`            |
| Vercel / Netlify env | `VITE_SUPABASE_ANON_KEY`       |

If something doesn’t work, check:
- The SQL migration was run in Supabase (Step 2 in the main README).
- The two env vars are set exactly as above (no extra spaces, same names).
- You redeployed **after** adding the env vars.
