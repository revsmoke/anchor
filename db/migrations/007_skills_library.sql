create table if not exists skill_definitions (
  id text primary key,
  module text not null,
  name text not null,
  situation_tags text[] not null default '{}'::text[],
  when_to_use text not null,
  why_it_helps text not null,
  steps jsonb not null,
  duration_seconds integer not null check (duration_seconds > 0),
  follow_up_prompt text not null,
  created_at timestamptz not null default now()
);

create table if not exists skill_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  skill_id text not null references skill_definitions(id) on delete restrict,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  helpfulness_rating integer not null check (helpfulness_rating between 0 and 5),
  source_context text not null,
  created_at timestamptz not null default now()
);

create index if not exists skill_sessions_user_created_idx
  on skill_sessions (user_id, created_at desc);

insert into skill_definitions (
  id,
  module,
  name,
  situation_tags,
  when_to_use,
  why_it_helps,
  steps,
  duration_seconds,
  follow_up_prompt
)
values
  (
    'stop',
    'distress_tolerance',
    'STOP',
    array['overwhelm', 'urge'],
    'Use when emotion or urges spike and you need a pause before acting.',
    'It creates enough space to choose the next effective step.',
    '["Stop.", "Take a step back.", "Observe.", "Proceed mindfully."]'::jsonb,
    90,
    'What did you notice before choosing your next step?'
  ),
  (
    'paced_breathing',
    'distress_tolerance',
    'Paced Breathing',
    array['panic', 'body'],
    'Use when your body is activated and you need to slow down.',
    'Longer exhales can reduce physical arousal.',
    '["Inhale for four.", "Exhale for six.", "Repeat for two minutes."]'::jsonb,
    120,
    'What changed after paced breathing?'
  ),
  (
    'opposite_action',
    'emotion_regulation',
    'Opposite Action',
    array['avoidance', 'sadness'],
    'Use when an emotion does not fit the facts or is not effective.',
    'Acting opposite can change the emotion over time.',
    '["Name the emotion.", "Check the facts.", "Choose one opposite action."]'::jsonb,
    180,
    'What small opposite action did you try?'
  )
on conflict (id) do nothing;
