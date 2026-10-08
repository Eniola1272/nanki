begin;
create table if not exists public.card_reviews (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 deck_id text not null,
 card_id text not null,
 rating text not null check (rating in ('again','hard','good','easy')),
 reviewed_at timestamptz not null,
 study_day date not null
);
create index if not exists card_reviews_user_time on public.card_reviews(user_id,reviewed_at,id);
alter table public.card_reviews enable row level security;
drop policy if exists "Read own reviews" on public.card_reviews;
create policy "Read own reviews" on public.card_reviews for select to authenticated using (user_id=auth.uid());
drop policy if exists "Insert own reviews" on public.card_reviews;
create policy "Insert own reviews" on public.card_reviews for insert to authenticated with check (user_id=auth.uid());
revoke all on public.card_reviews from anon, authenticated;
grant select, insert on public.card_reviews to authenticated;
create table if not exists public.review_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 new_cards integer not null default 20 check (new_cards between 0 and 200),
 reviews integer not null default 100 check (reviews between 1 and 1000)
);
alter table public.review_preferences enable row level security;
drop policy if exists "Own review preferences" on public.review_preferences;
create policy "Own review preferences" on public.review_preferences for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
revoke all on public.review_preferences from anon, authenticated;
grant select, insert, update on public.review_preferences to authenticated;
commit;

-- Serialize mistake imports per learner so retries/two tabs cannot duplicate sources.
create or replace function public.save_mistake_flashcards(p_deck_id uuid, p_title text, p_category text, p_cards jsonb)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare owner uuid := auth.uid(); target public.decks%rowtype; fresh jsonb; result jsonb;
begin
 if owner is null then raise exception 'Sign in to save cards'; end if;
 if jsonb_typeof(p_cards) <> 'array' or jsonb_array_length(p_cards) = 0 or jsonb_array_length(p_cards) > 1000 then raise exception 'Choose 1–1000 cards'; end if;
 if exists (select 1 from jsonb_array_elements(p_cards) c where
   coalesce(length(trim(c->>'front')),0)=0 or coalesce(length(trim(c->>'back')),0)=0
   or coalesce(c->>'id','')='' or coalesce(c->'source'->>'quizId','')='' or coalesce(c->'source'->>'questionId','')='') then raise exception 'Invalid card or source'; end if;
 perform pg_advisory_xact_lock(hashtextextended('nanki-mistakes:'||owner::text,0));
 select * into target from public.decks where id=p_deck_id for update;
 if found and (target.user_id <> owner or target.published) then raise exception 'Choose your own private deck'; end if;
 select coalesce(jsonb_agg(card),'[]'::jsonb) into fresh from (
  select distinct on (c->'source'->>'quizId',c->'source'->>'questionId',coalesce(c->'source'->>'branch','')) c as card
  from jsonb_array_elements(p_cards) c
  where not exists (
   select 1 from public.decks d cross join lateral jsonb_array_elements(d.content) old
   where d.user_id=owner and old->'source'->>'quizId'=c->'source'->>'quizId'
   and old->'source'->>'questionId'=c->'source'->>'questionId'
   and coalesce(old->'source'->>'branch','')=coalesce(c->'source'->>'branch','')
  )
 ) filtered;
 if jsonb_array_length(fresh)=0 then return jsonb_build_object('added',0); end if;
 if target.id is null then
  insert into public.decks(id,user_id,title,description,category,content,published)
  values(p_deck_id,owner,coalesce(nullif(trim(p_title),''),'Quiz mistakes'),'Flashcards from missed quiz answers',p_category,fresh,false) returning * into target;
 else
  update public.decks set content=coalesce(content,'[]'::jsonb)||fresh where id=p_deck_id returning * into target;
 end if;
 return jsonb_build_object('added',jsonb_array_length(fresh),'deck',to_jsonb(target));
end $$;
revoke all on function public.save_mistake_flashcards(uuid,text,text,jsonb) from public,anon;
grant execute on function public.save_mistake_flashcards(uuid,text,text,jsonb) to authenticated;
