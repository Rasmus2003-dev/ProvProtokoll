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

-- Aktivera Realtime så flera inspektörer ser varandras ändringar live
-- (kräver att "Realtime" är påslaget för dessa tabeller i Supabase Dashboard
-- under Database > Replication, om det inte redan är globalt aktiverat).
ALTER PUBLICATION supabase_realtime ADD TABLE protocols;
ALTER PUBLICATION supabase_realtime ADD TABLE elever;
