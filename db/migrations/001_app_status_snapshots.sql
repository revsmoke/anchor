create table if not exists app_status_snapshots (
  id integer generated always as identity primary key,
  product_name text not null,
  snapshot_date date not null,
  morning_anchor_summary text not null,
  created_at timestamptz not null default now()
);
