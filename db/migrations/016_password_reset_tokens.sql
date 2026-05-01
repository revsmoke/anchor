create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null,
  request_metadata jsonb not null default '{}'::jsonb,
  attempt_count integer not null default 0,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

alter table password_reset_tokens
  add column if not exists attempt_count integer not null default 0;

alter table password_reset_tokens
  add column if not exists locked_at timestamptz;

create index if not exists password_reset_tokens_user_active_idx
  on password_reset_tokens (user_id, expires_at)
  where used_at is null;
