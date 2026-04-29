create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  timezone text not null,
  wake_time text not null,
  sleep_time text not null,
  goals text[] not null,
  struggles text[] not null,
  therapy_status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists routine_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  target_time text not null,
  steps text[] not null,
  created_at timestamptz not null default now()
);

create table if not exists routine_instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  routine_template_id uuid not null references routine_templates(id) on delete cascade,
  instance_date date not null,
  target_time text not null,
  status text not null default 'scheduled',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan_date date not null,
  next_best_step text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan_date)
);
