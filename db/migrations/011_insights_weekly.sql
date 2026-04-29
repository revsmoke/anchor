create table if not exists weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  week_start date not null,
  wins jsonb not null default '[]'::jsonb,
  misses jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  source_evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);
