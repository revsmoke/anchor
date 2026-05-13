create table if not exists daily_focus_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan_date date not null default current_date,
  focus_text text not null,
  anticipated_hard_moment text not null,
  planned_skill text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan_date)
);

create index if not exists daily_focus_plans_user_date_idx
  on daily_focus_plans (user_id, plan_date desc);
