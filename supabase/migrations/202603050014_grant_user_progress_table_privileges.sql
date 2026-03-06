grant usage on schema public to authenticated;

grant select, insert, update, delete on table public.user_stats to authenticated;
grant select, insert, update, delete on table public.user_card_state to authenticated;
