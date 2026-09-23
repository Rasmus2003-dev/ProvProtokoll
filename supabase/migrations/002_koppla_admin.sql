-- Kopplar Auth-användaren rasmus@provprotokoll.se till admin-profilen "rasmus".
-- Kör i Supabase SQL Editor efter 001_auth_och_rls.sql. Går att köra flera gånger.

do $$
declare
  v_auth_id uuid;
begin
  select id into v_auth_id from auth.users where lower(email) = 'rasmus@provprotokoll.se';
  if v_auth_id is null then
    raise exception 'Hittar ingen Auth-användare med e-post rasmus@provprotokoll.se. Kontrollera under Authentication > Users.';
  end if;

  -- Koppla loss användaren från ev. annan rad först (auth_id är unikt)
  update public.inspectors set auth_id = null where auth_id = v_auth_id and username <> 'rasmus';

  if exists (select 1 from public.inspectors where username = 'rasmus') then
    -- Profilen finns redan (oavsett id) – koppla den
    update public.inspectors
       set auth_id = v_auth_id, role = 'admin', active = true, must_change_password = false
     where username = 'rasmus';
  else
    insert into public.inspectors (id, username, name, email, role, depots, vehicle_categories, must_change_password, active, auth_id)
    values ('insp-rasmus', 'rasmus', 'Rasmus Lundin', 'Rasmus.03@hotmail.se', 'admin',
            array['Samtliga orter / Hela Sverige'],
            array['AM','A1','A2','A','B','BE','C1','C','C1E','CE','D1','D','D1E','DE','TAXI'],
            false, true, v_auth_id);
  end if;
end $$;

-- Kontroll: ska visa rasmus, admin, true och samma id i båda auth-kolumnerna.
select i.username, i.role, i.active, i.auth_id as profil_auth_id, u.id as auth_user_id, u.email, u.email_confirmed_at
from public.inspectors i
left join auth.users u on u.id = i.auth_id
where i.username = 'rasmus';
