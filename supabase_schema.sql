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
