create table if not exists voice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  mode text not null,
  do_not_save boolean not null default false,
  transcript_preview_enabled boolean not null default true,
  context_refs jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  transcript_opt_in boolean,
  saved_summary text
);

create index if not exists voice_sessions_user_started_idx
  on voice_sessions (user_id, started_at desc);
