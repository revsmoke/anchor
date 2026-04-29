create table if not exists diary_schemas (
  version text primary key,
  core_fields jsonb not null,
  custom_fields jsonb not null default '[]'::jsonb,
  export_mapping jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists behavior_targets (
  target_key text primary key,
  hierarchy_level text not null,
  label text not null,
  enabled_by_default boolean not null default true
);

create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  entry_date date not null,
  anchor_completion jsonb not null,
  emotion_ratings jsonb not null,
  urge_ratings jsonb not null,
  target_occurrences jsonb not null,
  skills_used text[] not null default '{}'::text[],
  overall_day_difficulty integer not null check (overall_day_difficulty between 0 and 5),
  optional_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

insert into diary_schemas (version, core_fields, export_mapping)
values (
  'v1',
  '{
    "emotionFields":["anxietyFear","sadness","anger","shame","guilt","numbness","joyCalm"],
    "urgeFields":["selfHarm","suicidality","substanceUse","bingeRestrictPurge","isolateAvoid","quitGiveUp","lashOut"],
    "targetKeys":["isolate_avoid","completed_anchor"]
  }'::jsonb,
  '{}'::jsonb
)
on conflict (version) do nothing;

insert into behavior_targets (target_key, hierarchy_level, label)
values
  ('self_harm_urge', 'life_threatening', 'Self-harm urge'),
  ('self_harm_action', 'life_threatening', 'Self-harm action'),
  ('suicidality_urge', 'life_threatening', 'Suicidality urge'),
  ('suicidality_plan_action', 'life_threatening', 'Suicidality plan/action'),
  ('skipped_therapy', 'therapy_interfering', 'Skipped therapy'),
  ('skipped_diary_card', 'therapy_interfering', 'Skipped diary card'),
  ('repeated_skipped_anchors', 'therapy_interfering', 'Repeated skipped anchors'),
  ('substance_use', 'quality_of_life_interfering', 'Substance use'),
  ('binge_restrict_purge', 'quality_of_life_interfering', 'Binge/restrict/purge'),
  ('isolate_avoid', 'quality_of_life_interfering', 'Isolate/avoid'),
  ('lash_out', 'quality_of_life_interfering', 'Lash out'),
  ('dissociation_shutdown', 'quality_of_life_interfering', 'Dissociation/shutdown'),
  ('quit_give_up', 'quality_of_life_interfering', 'Quit/give up'),
  ('used_skill', 'skills_generalization', 'Used skill'),
  ('completed_anchor', 'skills_generalization', 'Completed anchor'),
  ('completed_repair_action', 'skills_generalization', 'Completed repair action')
on conflict (target_key) do nothing;
