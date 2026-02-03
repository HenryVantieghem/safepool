-- SafePool: alerts table, underwater threshold, camera source_type
-- Run after 001_initial_schema.sql

-- Alerts table for right-sidebar feed
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facilities on delete cascade,
  camera_id uuid references cameras on delete set null,
  severity text not null,
  trigger_type text not null,
  description text,
  frame_data jsonb,
  thumbnail_url text,
  created_at timestamptz default now(),
  dismissed_at timestamptz
);

create index if not exists idx_alerts_created_at on alerts (created_at desc);
create index if not exists idx_alerts_facility on alerts (facility_id);
create index if not exists idx_alerts_dismissed on alerts (dismissed_at) where dismissed_at is null;

alter table alerts enable row level security;
create policy "Allow all for alerts" on alerts for all using (true) with check (true);

-- Alert settings: underwater threshold
alter table alert_settings
  add column if not exists underwater_threshold_seconds int default 8;

-- Cameras: source type and optional config
alter table cameras
  add column if not exists source_type text default 'hls';
alter table cameras
  add column if not exists stream_config jsonb;

-- Enable Realtime for alerts (run in Supabase Dashboard if using Realtime)
-- publication is typically enabled per-table in Supabase Dashboard > Database > Replication
