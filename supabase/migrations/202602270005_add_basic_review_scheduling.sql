alter table public.user_progress
add column if not exists review_interval_days integer not null default 1,
add column if not exists next_due_at timestamptz;
