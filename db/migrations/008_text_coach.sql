create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  agent_name text not null,
  specialists_used text[] not null default '{}'::text[],
  risk_tier text not null,
  mode text not null,
  input_fingerprint text not null,
  safety_decision jsonb not null,
  context_refs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  agent_run_id uuid references agent_runs(id) on delete set null,
  role text not null,
  message_fingerprint text,
  reply_text text,
  next_action jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agent_runs_user_created_idx
  on agent_runs (user_id, created_at desc);

create index if not exists coach_messages_user_created_idx
  on coach_messages (user_id, created_at desc);
