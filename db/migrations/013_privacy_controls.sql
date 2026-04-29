create table if not exists user_settings (
  user_id uuid primary key references users(id) on delete cascade,
  transcript_retention_days integer not null default 0,
  trace_retention_days integer not null default 30,
  audio_consent boolean not null default false,
  share_consent boolean not null default false,
  notification_opt_in boolean not null default false,
  quiet_hours_start text not null default '22:00',
  quiet_hours_end text not null default '07:00',
  updated_at timestamptz not null default now()
);

create table if not exists privacy_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  format text not null,
  date_range jsonb not null,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists delete_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  scope text not null,
  scheduled_deletion_at timestamptz not null,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);
