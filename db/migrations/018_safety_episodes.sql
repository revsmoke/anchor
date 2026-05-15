alter table safety_events
  add column if not exists resolution_status text not null default 'open',
  add column if not exists resolution_note text not null default '',
  add column if not exists resolved_at timestamptz;

create table if not exists safety_episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  source_event_id uuid,
  status text not null default 'active',
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution_note text not null default ''
);

alter table safety_events
  add column if not exists safety_episode_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'safety_events_safety_episode_id_fkey'
      and conrelid = 'safety_events'::regclass
  ) then
    alter table safety_events
      add constraint safety_events_safety_episode_id_fkey
      foreign key (safety_episode_id)
      references safety_episodes(id)
      on delete set null;
  end if;
end $$;
