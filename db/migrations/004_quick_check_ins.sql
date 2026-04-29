create table if not exists quick_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null,
  anchor_context text not null,
  primary_emotion_score integer not null check (primary_emotion_score between 0 and 5),
  primary_urge_score integer not null check (primary_urge_score between 0 and 5),
  energy_state text not null,
  suggested_next_action_status text not null,
  suggested_next_action jsonb not null,
  risk_tier text not null,
  note text,
  location_context text
);

create table if not exists safety_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  detected_at timestamptz not null default now(),
  risk_tier text not null,
  trigger_type text not null,
  outcome text not null,
  context jsonb not null default '{}'::jsonb
);

alter table routine_instances
  add column if not exists completed_check_in_id uuid references quick_check_ins(id);

alter table daily_plans
  add column if not exists next_action_status text not null default 'accepted';
