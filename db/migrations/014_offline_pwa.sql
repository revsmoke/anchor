create table if not exists offline_mutations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  client_id text not null,
  client_mutation_id text not null,
  entity_type text not null,
  operation text not null,
  occurred_at timestamptz not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, client_mutation_id)
);

create index if not exists offline_mutations_user_created_idx
  on offline_mutations (user_id, created_at desc);
