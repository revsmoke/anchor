create table if not exists session_packets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date_range jsonb not null,
  included_sections text[] not null default '{}'::text[],
  redactions jsonb not null default '{}'::jsonb,
  share_mode text not null default 'download',
  status text not null default 'ready',
  created_at timestamptz not null default now()
);

create index if not exists session_packets_user_created_idx
  on session_packets (user_id, created_at desc);
