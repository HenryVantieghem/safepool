# Supabase Setup via MCP or Dashboard

## Option 1: Supabase MCP (when connected)

If the Supabase MCP is connected in Cursor, ask the AI to:

1. Run `apply_migration` with the SQL from `supabase/migrations/001_initial_schema.sql`
2. Run `get_project_url` and `get_publishable_keys` to fill `.env.local`

## Option 2: Manual setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/lxwepiocbsrbrwaboimv)
2. Open **SQL Editor** and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Go to **Settings > API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
4. Create `.env.local` with these values

## Email verification

Email verification is disabled in this project. New users are signed in immediately after registration.
