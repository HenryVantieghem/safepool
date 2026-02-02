# SafePool — AI-Powered Pool Safety

Extra underwater eyes for lifeguards. Real-time distress detection that assists—never replaces—human vigilance.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in **SQL Editor**:

```bash
# Copy contents of supabase/migrations/001_initial_schema.sql
```

3. Enable Email auth in **Authentication > Providers**
4. Copy your project URL and anon key from **Settings > API**

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
```

### 4. Run locally

```bash
npm run dev
```

### 5. Demo video (optional)

Add a pool video at `public/demo/pool-demo.mp4` for the Live Feeds demo. Or use **Upload Video** in the dashboard.

## Deploy to Vercel

1. Push to GitHub and import the repo in [vercel.com](https://vercel.com)
2. Add the same env vars in Project Settings
3. Deploy

Or use the Vercel CLI:

```bash
npx vercel
```

## Tech stack

- Next.js 14 (App Router)
- Supabase (Auth + Postgres)
- OpenAI Vision (GPT-4o-mini) for distress detection
- Tailwind CSS

## Full build prompt & context

For AI-assisted development or full functionality specs (live streaming, multi-camera, alerts sidebar, underwater duration rules, modern UI), see [`.cursor/CONTEXT.md`](.cursor/CONTEXT.md).
