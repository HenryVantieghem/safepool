-- SafePool initial schema
-- Run this in Supabase Dashboard > SQL Editor, or via Supabase CLI

create table if not exists facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_at timestamptz default now()
);

create table if not exists cameras (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references facilities on delete cascade,
  name text not null,
  stream_url text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references facilities on delete cascade,
  camera_id uuid references cameras on delete set null,
  severity text not null,
  detected_at timestamptz default now(),
  frame_data jsonb,
  resolved_at timestamptz
);

create table if not exists alert_settings (
  facility_id uuid primary key references facilities on delete cascade,
  sensitivity text default 'medium',
  cooldown_seconds int default 30
);

create table if not exists demo_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  facility_type text,
  message text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table facilities enable row level security;
alter table cameras enable row level security;
alter table incidents enable row level security;
alter table alert_settings enable row level security;
alter table demo_requests enable row level security;

-- Policies: allow authenticated users to read/write their data
-- For MVP, use permissive policies; refine for production
create policy "Allow all for facilities" on facilities for all using (true) with check (true);
create policy "Allow all for cameras" on cameras for all using (true) with check (true);
create policy "Allow all for incidents" on incidents for all using (true) with check (true);
create policy "Allow all for alert_settings" on alert_settings for all using (true) with check (true);
create policy "Allow insert for demo_requests" on demo_requests for insert with check (true);
create policy "Allow read for demo_requests" on demo_requests for select using (auth.role() = 'service_role');
