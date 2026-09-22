-- SQL Script to create tables in Supabase for ProvProtokoll
-- Kör detta i Supabase SQL Editor: https://supabase.com/dashboard/project/zgtejpyvrcjlvllolrny/sql

CREATE TABLE IF NOT EXISTS protocols (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  student_name TEXT,
  personal_number TEXT,
  license_type TEXT,
  test_type TEXT,
  transmission TEXT,
  tachograph TEXT,
  driving_result TEXT,
  safety_result TEXT,
  examiner TEXT,
  full_state JSONB
);

-- RLS (Row Level Security) policies
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

-- Tillåt läsning och skrivning för alla autentiserade och anonyma klienter med anon-nyckeln
CREATE POLICY "Allow public insert to protocols" 
ON protocols FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow public read from protocols" 
ON protocols FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public update to protocols"
ON protocols FOR UPDATE
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public delete from protocols"
ON protocols FOR DELETE
TO anon, authenticated
USING (true);

-- Elevregister: gemensamt register över provkandidater (Trafikverket TRV)
-- och trafikelever, delat mellan alla inspektörer/enheter istället för att
-- bara ligga i en enskild webbläsares localStorage.
CREATE TABLE IF NOT EXISTS elever (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT NOT NULL CHECK (source IN ('trv', 'trafikskola')),
  name TEXT NOT NULL,
  personal_number TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  license_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  test_type TEXT,
  booking_time TEXT,
  status TEXT NOT NULL,
  teacher TEXT,
  created_date TEXT NOT NULL
);

ALTER TABLE elever ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to elever"
ON elever FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public read from elever"
ON elever FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public update to elever"
ON elever FOR UPDATE
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public delete from elever"
ON elever FOR DELETE
TO anon, authenticated
USING (true);

-- Inspektörskonton. Rasmus är superadmin (roll 'admin', access till alla
-- kontor/behörigheter). Andra inspektörer skapas av en admin i appen, får
-- ett tillfälligt lösenord, och tvingas byta det vid första inloggning.
-- Lösenord lagras ALDRIG i klartext, bara som ett salt+hash-par (PBKDF2/SHA-256
-- via Web Crypto), beräknat på klienten innan det skickas till databasen.
CREATE TABLE IF NOT EXISTS inspectors (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'inspector' CHECK (role IN ('admin', 'inspector')),
  depots TEXT[] NOT NULL DEFAULT '{}',
  vehicle_categories TEXT[] NOT NULL DEFAULT '{}',
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE inspectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to inspectors"
ON inspectors FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public read from inspectors"
ON inspectors FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public update to inspectors"
ON inspectors FOR UPDATE
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public delete from inspectors"
ON inspectors FOR DELETE
TO anon, authenticated
USING (true);

-- Fiktiv Vägtrafikregister-data kopplad till kandidater via personnummer.
-- Detta ÄR INTE en kopia av Transportstyrelsens riktiga vägtrafikregister -
-- bara fiktiv testdata i samma anda (körkortsstatus, spärrar, anmärkningar)
-- så inspektören kan se en realistisk bakgrund på testkandidaterna i appen.
CREATE TABLE IF NOT EXISTS vagtrafikregister (
  personal_number TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  license_status TEXT NOT NULL DEFAULT 'Giltigt' CHECK (license_status IN ('Giltigt', 'Indraget', 'Spärrat', 'Återkallat tillfälligt', 'Saknar körkort')),
  license_classes TEXT[] NOT NULL DEFAULT '{}',
  status_reason TEXT,
  status_since TEXT,
  remarks TEXT[] NOT NULL DEFAULT '{}',
  previous_revocations INTEGER NOT NULL DEFAULT 0,
  medical_restriction TEXT
);

ALTER TABLE vagtrafikregister ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to vagtrafikregister"
ON vagtrafikregister FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public read from vagtrafikregister"
ON vagtrafikregister FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public update to vagtrafikregister"
ON vagtrafikregister FOR UPDATE
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public delete from vagtrafikregister"
ON vagtrafikregister FOR DELETE
TO anon, authenticated
USING (true);

-- Aktivera Realtime så flera inspektörer ser varandras ändringar live
-- (kräver att "Realtime" är påslaget för dessa tabeller i Supabase Dashboard
-- under Database > Replication, om det inte redan är globalt aktiverat).
ALTER PUBLICATION supabase_realtime ADD TABLE protocols;
ALTER PUBLICATION supabase_realtime ADD TABLE elever;
ALTER PUBLICATION supabase_realtime ADD TABLE inspectors;
ALTER PUBLICATION supabase_realtime ADD TABLE vagtrafikregister;
