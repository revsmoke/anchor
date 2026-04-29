create table if not exists chain_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  source_diary_entry_id text,
  prompting_event text not null,
  vulnerabilities jsonb not null default '[]'::jsonb,
  links jsonb not null default '[]'::jsonb,
  consequences jsonb not null default '[]'::jsonb,
  alternatives jsonb not null default '[]'::jsonb,
  prevention_plan text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chain_analyses_user_created_idx
  on chain_analyses (user_id, created_at desc);
