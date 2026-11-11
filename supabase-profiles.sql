create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text not null
        check (char_length(btrim(display_name)) between 1 and 40),
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

grant select on public.profiles to anon, authenticated;
grant insert (id, display_name), update (display_name)
    on public.profiles to authenticated;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
    on public.profiles for select
    using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
    on public.profiles for insert
    with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
    on public.profiles for update
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);

create or replace function public.create_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, display_name)
    values (
        new.id,
        coalesce(
            nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
            '表示名未設定'
        )
    );
    return new;
end;
$$;

drop trigger if exists create_profile_after_auth_user_signup on auth.users;
create trigger create_profile_after_auth_user_signup
    after insert on auth.users
    for each row execute function public.create_profile_for_new_auth_user();

insert into public.profiles (id, display_name)
select
    id,
    coalesce(
        nullif(trim(raw_user_meta_data ->> 'display_name'), ''),
        '表示名未設定'
    )
from auth.users
on conflict (id) do nothing;
