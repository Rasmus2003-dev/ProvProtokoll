-- Ger Auth-användaren rasmus.03@hotmail.se inspektörsroll, så att kontot kan
-- logga in i appen (användarnamn = hela e-postadressen).
-- Kör i Supabase SQL Editor efter 001 och 002. Går att köra flera gånger.
--
-- FÖRE körning: användaren måste finnas under Authentication > Users.
-- Saknas den: "Add user" > "Create new user", e-post rasmus.03@hotmail.se,
-- ett lösenord (minst 8 tecken) och [x] Auto Confirm User.
--
-- Admin-kontot "rasmus" (rasmus@provprotokoll.se) påverkas inte.

do $$
declare
  v_auth_id uuid;
begin
  select id into v_auth_id from auth.users where lower(email) = 'rasmus.03@hotmail.se';
  if v_auth_id is null then
    raise exception 'Hittar ingen Auth-användare med e-post rasmus.03@hotmail.se. Skapa den under Authentication > Users först.';
  end if;

  -- Koppla loss användaren från ev. annan profil först (auth_id är unikt)
  update public.inspectors set auth_id = null where auth_id = v_auth_id and username <> 'rasmus03';

  if exists (select 1 from public.inspectors where username = 'rasmus03') then
    update public.inspectors
       set auth_id = v_auth_id, role = 'inspector', active = true
     where username = 'rasmus03';
  else
    insert into public.inspectors (id, username, name, email, role, depots, vehicle_categories, must_change_password, active, auth_id)
    values ('insp-rasmus03', 'rasmus03', 'Rasmus Lundin', 'rasmus.03@hotmail.se', 'inspector',
            array['Samtliga orter / Hela Sverige'],
            array['AM','A1','A2','A','B','BE','C1','C','C1E','CE','D1','D','D1E','DE','TAXI'],
            false, true, v_auth_id);
  end if;
end $$;

-- Kontroll: ska visa rasmus03, inspector, true och samma id i båda auth-kolumnerna.
select i.username, i.role, i.active, i.auth_id as profil_auth_id, u.id as auth_user_id, u.email
from public.inspectors i
left join auth.users u on u.id = i.auth_id
where i.username = 'rasmus03';
