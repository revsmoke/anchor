alter table daily_plans
  add column if not exists mode text not null default 'full_day',
  add column if not exists must_dos text[] not null default '{}'::text[],
  add column if not exists deferred_items text[] not null default '{}'::text[],
  add column if not exists regulation_action text not null default '',
  add column if not exists reset_history jsonb not null default '[]'::jsonb;
