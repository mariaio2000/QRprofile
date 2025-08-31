-- Fix the image_data column to ensure it's properly configured as bytea
-- This migration ensures the column can store binary data correctly

-- Drop and recreate the profile_images table with proper bytea configuration
DROP TABLE IF EXISTS profile_images CASCADE;

CREATE TABLE profile_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_data BYTEA NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png')),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 10485760), -- 10MB max
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_profile_images_profile_id ON profile_images(profile_id);
CREATE INDEX idx_profile_images_created_at ON profile_images(created_at);

-- Enable RLS
ALTER TABLE profile_images ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view own images" ON profile_images;
CREATE POLICY "Users can view own images" ON profile_images
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own images" ON profile_images;
CREATE POLICY "Users can insert own images" ON profile_images
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own images" ON profile_images;
CREATE POLICY "Users can update own images" ON profile_images
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own images" ON profile_images;
CREATE POLICY "Users can delete own images" ON profile_images
  FOR DELETE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_profile_images_updated_at ON profile_images;
CREATE TRIGGER update_profile_images_updated_at
  BEFORE UPDATE ON profile_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
