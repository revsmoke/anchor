create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  timezone text not null,
  locale text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists consent_records (
  id integer generated always as identity primary key,
  user_id uuid not null references users(id) on delete cascade,
  consent_type text not null,
  granted boolean not null,
  source text not null default 'web',
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists safety_plans (
  user_id uuid primary key references users(id) on delete cascade,
  warning_signs jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  contacts jsonb not null default '[]'::jsonb,
  crisis_resources jsonb not null default '[{"label":"Call 911","value":"911"},{"label":"Call or text 988","value":"988"}]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
