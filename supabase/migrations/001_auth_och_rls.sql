-- =====================================================================
-- ProvProtokoll: inloggning via Supabase Auth + låsta tabeller (RLS)
-- =====================================================================
-- Kör hela filen i Supabase: Dashboard > SQL Editor > New query > Run.
-- Filen går att köra flera gånger.
--
-- FÖRE körning: skapa admin-användaren under Authentication > Users >
--   "Add user" > "Create new user"
--     E-post:   rasmus@provprotokoll.se
--     Lösenord: (ditt nya lösenord, minst 8 tecken)
--     [x] Auto Confirm User
-- Användarnamnet i appen blir då "rasmus".
--
-- Efter körning:
--   * Bara inloggade, aktiva inspektörer kan läsa/skriva protokoll,
--     elevregister och vägtrafikregister.
--   * Bara administratörer kan hantera inspektörskonton och radera protokoll.
--   * Den publika (anon) nyckeln ger inte längre åtkomst till någon data.
-- =====================================================================

-- ---------- Tabeller (skapas om de saknas) ----------

create table if not exists public.protocols (
  id text primary key,
  created_at timestamptz default now(),
  student_name text,
  personal_number text,
  license_type text,
  test_type text,
  transmission text,
  tachograph text,
  driving_result text,
  safety_result text,
  examiner text,
  full_state jsonb
);

create table if not exists public.elever (
  id text primary key,
  created_at timestamptz default now(),
  source text not null check (source in ('trv', 'trafikskola')),
  name text not null,
  personal_number text not null,
  email text,
  phone text,
  license_type text not null,
  transmission text not null,
  test_type text,
  booking_time text,
  status text not null,
  teacher text,
  created_date text not null
);

create table if not exists public.vagtrafikregister (
  personal_number text primary key,
  created_at timestamptz default now(),
  license_status text not null default 'Giltigt',
  license_classes text[] not null default '{}',
  status_reason text,
  status_since text,
  remarks text[] not null default '{}',
  previous_revocations integer not null default 0,
  medical_restriction text
);

create table if not exists public.inspectors (
  id text primary key,
  created_at timestamptz default now(),
  username text unique not null,
  name text not null,
  email text,
  role text not null default 'inspector' check (role in ('admin', 'inspector')),
  depots text[] not null default '{}',
  vehicle_categories text[] not null default '{}',
  must_change_password boolean not null default true,
  active boolean not null default true
);

-- Koppling till Supabase Auth. Lösenord hanteras nu helt av Supabase Auth.
alter table public.inspectors add column if not exists auth_id uuid unique references auth.users(id) on delete cascade;
alter table public.inspectors drop column if exists password_hash;
alter table public.inspectors drop column if exists password_salt;

-- ---------- Hjälpfunktioner för policyerna ----------
-- SECURITY DEFINER så att policyerna kan slå upp inloggad inspektör utan
-- att själva fastna i inspectors-tabellens egna policyer.

create or replace function public.is_active_inspector()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.inspectors where auth_id = auth.uid() and active);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.inspectors where auth_id = auth.uid() and active and role = 'admin');
$$;

-- Inspektören markerar själv att lösenordet är bytt (efter supabase.auth.updateUser)
create or replace function public.mark_password_changed()
returns void language sql security definer set search_path = public as $$
  update public.inspectors set must_change_password = false where auth_id = auth.uid();
$$;

revoke all on function public.is_active_inspector() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.mark_password_changed() from public, anon;
grant execute on function public.is_active_inspector() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.mark_password_changed() to authenticated;

-- ---------- Ta bort alla gamla, öppna policyer ----------

do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in ('protocols', 'elever', 'vagtrafikregister', 'inspectors')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

alter table public.protocols enable row level security;
alter table public.elever enable row level security;
alter table public.vagtrafikregister enable row level security;
alter table public.inspectors enable row level security;

-- Anon-nyckeln ska inte kunna göra något alls mot tabellerna
revoke all on public.protocols, public.elever, public.vagtrafikregister, public.inspectors from anon;
grant select, insert, update, delete on public.protocols, public.elever, public.vagtrafikregister, public.inspectors to authenticated;

-- ---------- Nya policyer ----------

-- Protokoll: aktiva inspektörer läser/skapar/uppdaterar, bara admin raderar
create policy "inspektörer läser protokoll" on public.protocols for select to authenticated using (public.is_active_inspector());
create policy "inspektörer skapar protokoll" on public.protocols for insert to authenticated with check (public.is_active_inspector());
create policy "inspektörer uppdaterar protokoll" on public.protocols for update to authenticated using (public.is_active_inspector()) with check (public.is_active_inspector());
create policy "admin raderar protokoll" on public.protocols for delete to authenticated using (public.is_admin());

-- Elevregister och vägtrafikregister: aktiva inspektörer
create policy "inspektörer hanterar elever" on public.elever for all to authenticated using (public.is_active_inspector()) with check (public.is_active_inspector());
create policy "inspektörer hanterar vagtrafikregister" on public.vagtrafikregister for all to authenticated using (public.is_active_inspector()) with check (public.is_active_inspector());

-- Inspektörer: man ser sin egen rad (även om inaktiverad, för felmeddelandet),
-- admin ser och hanterar alla
create policy "se egen profil eller admin ser alla" on public.inspectors for select to authenticated using (auth_id = auth.uid() or public.is_admin());
create policy "admin skapar inspektörer" on public.inspectors for insert to authenticated with check (public.is_admin());
create policy "admin uppdaterar inspektörer" on public.inspectors for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin raderar inspektörer" on public.inspectors for delete to authenticated using (public.is_admin());

-- ---------- Första administratören ----------
-- Kopplar Auth-användaren rasmus@provprotokoll.se till en admin-profil.

insert into public.inspectors (id, username, name, email, role, depots, vehicle_categories, must_change_password, active, auth_id)
select 'insp-rasmus', 'rasmus', 'Rasmus Lundin', 'Rasmus.03@hotmail.se', 'admin',
       array['Samtliga orter / Hela Sverige'],
       array['AM','A1','A2','A','B','BE','C1','C','C1E','CE','D1','D','D1E','DE','TAXI'],
       false, true, u.id
from auth.users u
where u.email = 'rasmus@provprotokoll.se'
on conflict (id) do update set auth_id = excluded.auth_id, role = 'admin', active = true;

-- Kontroll: ska visa en rad med auth_id ifyllt. Tom = Auth-användaren saknas (se överst).
select id, username, role, active, auth_id from public.inspectors where username = 'rasmus';
