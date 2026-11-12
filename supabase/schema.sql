-- ==============================================================================
-- CANOPY PLANT HEALTH APP — COMPLETE SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this script in your Supabase Dashboard:
-- 1. Go to your Supabase Project -> SQL Editor
-- 2. Click "New Query"
-- 3. Paste this entire file and click "Run"
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- A. PLANTS TABLE (Your personal home collection)
CREATE TABLE IF NOT EXISTS public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT,
  location TEXT NOT NULL DEFAULT 'Living room',
  image_url TEXT NOT NULL DEFAULT '/images/plant-diagnosis-leaf.jpg',
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'needs_attention', 'critical')),
  status_label TEXT DEFAULT 'Looking good',
  water_schedule TEXT DEFAULT 'Every 7 days',
  light_needs TEXT DEFAULT 'Bright indirect',
  last_checked TEXT DEFAULT 'Checked today',
  last_watered_at TIMESTAMPTZ,
  next_watering_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- B. SCANNED PLANTS TABLE (Outdoor, wild, or photographed flora not in your care)
CREATE TABLE IF NOT EXISTS public.scanned_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scientific_name TEXT,
  location_tag TEXT NOT NULL DEFAULT 'Field scan',
  image_url TEXT NOT NULL DEFAULT '/images/plant-diagnosis-leaf.jpg',
  condition TEXT NOT NULL DEFAULT 'Healthy wild foliage',
  notes TEXT,
  scanned_at TEXT DEFAULT 'Today',
  adopted_to_my_plants BOOLEAN NOT NULL DEFAULT FALSE,
  adopted_plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- C. DIAGNOSES TABLE (Health checks and AI diagnoses)
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  plant_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  issue TEXT NOT NULL DEFAULT 'Leaf check-up',
  severity TEXT NOT NULL DEFAULT 'healthy' CHECK (severity IN ('healthy', 'needs_attention', 'critical')),
  severity_label TEXT DEFAULT 'Looking good',
  summary TEXT,
  notes TEXT,
  action_steps JSONB DEFAULT '[]'::jsonb,
  watering_schedule TEXT,
  light_recommendation TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- D. NOTIFICATIONS TABLE (Reminders, follow-ups, and tips)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'followup', 'tip')),
  plant_name TEXT,
  plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- E. CARE REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.care_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('water', 'fertilize', 'repot', 'prune', 'mist', 'rotate')),
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_plants_user_id ON public.plants(user_id);
CREATE INDEX IF NOT EXISTS idx_plants_status ON public.plants(status);
CREATE INDEX IF NOT EXISTS idx_scanned_plants_user_id ON public.scanned_plants(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_plant_id ON public.diagnoses(plant_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON public.diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_care_reminders_plant_id ON public.care_reminders(plant_id, completed);

-- ==============================================================================
-- 4. AUTOMATIC TRIGGERS & PROCEDURES
-- ==============================================================================

-- Trigger A: Update updated_at column automatically on plant edits
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_plants_updated_at ON public.plants;
CREATE TRIGGER trigger_plants_updated_at
  BEFORE UPDATE ON public.plants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger B: Create automatic notification when a new plant is added
CREATE OR REPLACE FUNCTION public.handle_new_plant_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, description, type, plant_name, plant_id, read)
  VALUES (
    NEW.user_id,
    'Welcome ' || NEW.name || '!',
    NEW.name || ' has been added to your care in ' || NEW.location || '. First watering scheduled.',
    'reminder',
    NEW.name,
    NEW.id,
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_plant_notification ON public.plants;
CREATE TRIGGER trigger_new_plant_notification
  AFTER INSERT ON public.plants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_plant_notification();

-- Trigger C: Create automatic follow-up notification when an issue is detected
CREATE OR REPLACE FUNCTION public.handle_diagnosis_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity IN ('needs_attention', 'critical') THEN
    INSERT INTO public.notifications (user_id, title, description, type, plant_name, plant_id, read)
    VALUES (
      NEW.user_id,
      'Attention needed: ' || NEW.plant_name,
      'A leaf check detected ' || LOWER(NEW.issue) || '. Check recommended care steps.',
      'followup',
      NEW.plant_name,
      NEW.plant_id,
      FALSE
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_diagnosis_alert ON public.diagnoses;
CREATE TRIGGER trigger_diagnosis_alert
  AFTER INSERT ON public.diagnoses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_diagnosis_alert();

-- Helper Stored Procedure: Mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(target_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  IF target_user_id IS NOT NULL THEN
    UPDATE public.notifications SET read = TRUE WHERE user_id = target_user_id AND read = FALSE;
  ELSE
    UPDATE public.notifications SET read = TRUE WHERE read = FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Helper Stored Procedure: Mark plant as watered (updates timestamps)
CREATE OR REPLACE FUNCTION public.mark_plant_watered(target_plant_id UUID, days_until_next INT DEFAULT 7)
RETURNS VOID AS $$
BEGIN
  UPDATE public.plants
  SET
    last_watered_at = timezone('utc'::text, now()),
    next_watering_at = timezone('utc'::text, now()) + (days_until_next || ' days')::INTERVAL,
    last_checked = 'Watered today'
  WHERE id = target_plant_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Enables full privacy for authenticated users while allowing public demo access
-- for initial testing when user_id is null.

ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_reminders ENABLE ROW LEVEL SECURITY;

-- Plants policies
CREATE POLICY "Public & Own Plants Select" ON public.plants
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Plants Insert" ON public.plants
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Plants Update" ON public.plants
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Plants Delete" ON public.plants
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Scanned plants policies
CREATE POLICY "Public & Own Scanned Plants Select" ON public.scanned_plants
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Scanned Plants Insert" ON public.scanned_plants
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Scanned Plants Update" ON public.scanned_plants
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Scanned Plants Delete" ON public.scanned_plants
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Diagnoses policies
CREATE POLICY "Public & Own Diagnoses Select" ON public.diagnoses
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Diagnoses Insert" ON public.diagnoses
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Diagnoses Update" ON public.diagnoses
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Diagnoses Delete" ON public.diagnoses
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Notifications policies
CREATE POLICY "Public & Own Notifications Select" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Notifications Insert" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Notifications Update" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Notifications Delete" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Care reminders policies
CREATE POLICY "Public & Own Care Reminders Select" ON public.care_reminders
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Care Reminders Insert" ON public.care_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Care Reminders Update" ON public.care_reminders
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public & Own Care Reminders Delete" ON public.care_reminders
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- ==============================================================================
-- 6. SUPABASE REALTIME REPLICATION
-- ==============================================================================
-- Allows live instantaneous UI updates across devices when data changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'plants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.plants;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'scanned_plants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scanned_plants;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'diagnoses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.diagnoses;
  END IF;
END $$;

-- ==============================================================================
-- 7. SUPABASE STORAGE BUCKET (Plant leaf images)
-- ==============================================================================
-- Inserts the public storage bucket for photos if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-photos', 'plant-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage bucket access policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Plant Photos'
  ) THEN
    CREATE POLICY "Public Access for Plant Photos"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'plant-photos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow Uploads to Plant Photos'
  ) THEN
    CREATE POLICY "Allow Uploads to Plant Photos"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'plant-photos');
  END IF;
END $$;

-- ==============================================================================
-- 8. INITIAL SEED DATA
-- ==============================================================================
-- Clears and pre-populates initial plants, scanned flora, diagnoses, and notifications

-- 1. Insert Initial Plants (My plants)
INSERT INTO public.plants (id, name, location, image_url, status, status_label, last_checked, water_schedule, light_needs)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Monstera', 'Living room', '/images/plant-diagnosis-leaf.jpg', 'needs_attention', 'NEEDS A LOOK', 'Checked today', 'Every 7 days', 'Indirect bright'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Olive tree', 'Balcony', '/images/plant-diagnosis-leaf.jpg', 'healthy', 'LOOKING GOOD', '3 days ago', 'Every 10 days', 'Full sun'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Fiddle leaf fig', 'Bedroom', '/images/plant-diagnosis-leaf.jpg', 'healthy', 'LOOKING GOOD', '1 week ago', 'Every 7 days', 'Bright filtered')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  status = EXCLUDED.status;

-- 2. Insert Initial Scanned Plants (External flora)
INSERT INTO public.scanned_plants (id, name, scientific_name, location_tag, image_url, scanned_at, condition, notes)
VALUES
  ('d4e5f6a7-b890-12cd-ef12-345678901234', 'Japanese Maple', 'Acer palmatum', 'City Botanical Garden', '/images/plant-diagnosis-leaf.jpg', 'Oct 24', 'Healthy seasonal foliage', 'Deep crimson palmate leaves, thriving in partial shade near walking path.'),
  ('e5f6a7b8-9012-cdef-1234-567890123456', 'Silver Dollar Eucalyptus', 'Eucalyptus cinerea', 'Outdoor Flower Market', '/images/plant-diagnosis-leaf.jpg', 'Nov 1', 'Vibrant & aromatic', 'Round silvery-blue leaves with powdery surface. Displayed in nursery courtyard.'),
  ('f6a7b890-12cd-ef12-3456-789012345678', 'Bird of Paradise', 'Strelitzia reginae', 'Office Atrium', '/images/plant-diagnosis-leaf.jpg', 'Nov 5', 'Dry leaf margins', 'Large split foliage showing signs of low humidity from AC vents.'),
  ('a7b89012-cdef-1234-5678-901234567890', 'Wild Maidenhair Fern', 'Adiantum capillus-veneris', 'River Trail Hike', '/images/plant-diagnosis-leaf.jpg', 'Nov 9', 'Lush wild growth', 'Growing along shaded damp limestone rock face near running stream.')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Initial Diagnoses
INSERT INTO public.diagnoses (id, plant_id, plant_name, image_url, issue, severity, severity_label, summary, notes, action_steps)
VALUES
  (
    '11111111-2222-3333-4444-555555555555',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Monstera',
    '/images/plant-diagnosis-leaf.jpg',
    'Leaf discoloration',
    'needs_attention',
    'NEEDS A LOOK',
    'Leaf margins showing mild discoloration from moisture fluctuations.',
    'A sample result for leaf discoloration. Check soil moisture and light exposure before changing your care routine.',
    '["Check top 2 inches of soil with your finger", "Avoid standing water in cachepot", "Wipe dust from foliage"]'::jsonb
  ),
  (
    '22222222-3333-4444-5555-666666666666',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Olive tree',
    '/images/plant-diagnosis-leaf.jpg',
    'Routine check-up',
    'healthy',
    'LOOKING GOOD',
    'Leaves are vibrant and firm. No signs of pests or disease.',
    'Healthy growth pattern. Keep up current watering schedule and full sun exposure.',
    '["Maintain current watering schedule", "Inspect lower stems weekly"]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Initial Notifications
INSERT INTO public.notifications (id, title, description, type, plant_name, read)
VALUES
  ('33333333-4444-5555-6666-777777777777', 'Watering due today', 'Monstera in Living room is due for water. Touch the top inch of soil first.', 'reminder', 'Monstera', FALSE),
  ('44444444-5555-6666-7777-888888888888', 'Diagnosis follow-up', 'It''s been 4 days since Monstera''s leaf check. Has the margin discoloration improved?', 'followup', 'Monstera', FALSE),
  ('55555555-6666-7777-8888-999999999999', 'Seasonal care tip', 'Winter light shift: days are shorter, consider rotating bedroom plants closer to natural light.', 'tip', NULL, FALSE)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Care Reminder
INSERT INTO public.care_reminders (plant_id, type, due_date)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'water', CURRENT_DATE);
