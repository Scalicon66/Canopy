-- Canopy Plant Health App - Supabase Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Plants table
CREATE TABLE plants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  image_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'needs_attention', 'critical')),
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diagnoses table
CREATE TABLE diagnoses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT DEFAULT '',
  issue TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'healthy' CHECK (severity IN ('healthy', 'needs_attention', 'critical')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care reminders table
CREATE TABLE care_reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('water', 'fertilize', 'repot', 'prune')),
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_reminders ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users can view own plants" ON plants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plants" ON plants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plants" ON plants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plants" ON plants
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own diagnoses" ON diagnoses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnoses" ON diagnoses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reminders" ON care_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON care_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON care_reminders
  FOR UPDATE USING (auth.uid() = user_id);

-- Seed data (for demo, no user_id so these are public)
-- You can modify these after setting up auth

-- Insert sample plants
INSERT INTO plants (id, name, location, status, last_checked) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Monstera', 'Living room', 'needs_attention', NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Olive tree', 'Balcony', 'healthy', NOW() - INTERVAL '3 days'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Fiddle leaf fig', 'Bedroom', 'healthy', NOW() - INTERVAL '7 days');

-- Insert sample diagnosis
INSERT INTO diagnoses (plant_id, issue, severity, notes) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Leaf discoloration', 'needs_attention', 'A sample result for leaf discoloration. Check soil moisture and light exposure before changing your care routine.');

-- Insert sample reminder
INSERT INTO care_reminders (plant_id, type, due_date) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'water', CURRENT_DATE);
