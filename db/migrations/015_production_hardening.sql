alter table voice_sessions
  add column if not exists openai_call_id text;

alter table session_packets
  add column if not exists artifact_id uuid;

alter table delete_requests
  add column if not exists completed_at timestamptz;

create table if not exists export_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  kind text not null,
  format text not null,
  storage_key text not null,
  byte_size integer not null default 0,
  redactions jsonb not null default '{}'::jsonb,
  source_id text,
  status text not null default 'ready',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days',
  deleted_at timestamptz
);

create index if not exists export_artifacts_user_created_idx
  on export_artifacts (user_id, created_at desc);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_user_created_idx
  on audit_events (user_id, created_at desc);
