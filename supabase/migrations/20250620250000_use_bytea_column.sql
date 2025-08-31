-- Migration to change image_data column back to BYTEA
-- This will avoid the hex encoding issue we're seeing with TEXT columns

-- Drop existing RLS policies and triggers first
DROP POLICY IF EXISTS "Users can view own images" ON profile_images;
DROP POLICY IF EXISTS "Users can manage own images" ON profile_images;
DROP POLICY IF EXISTS "Users can insert own images" ON profile_images;
DROP POLICY IF EXISTS "Users can update own images" ON profile_images;
DROP POLICY IF EXISTS "Users can delete own images" ON profile_images;
DROP POLICY IF EXISTS "Allow authenticated users to manage images" ON profile_images;
DROP TRIGGER IF EXISTS update_profile_images_updated_at ON profile_images;

-- Drop the existing table
DROP TABLE IF EXISTS profile_images;

-- Recreate the table with BYTEA column for binary storage
CREATE TABLE profile_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    image_data BYTEA NOT NULL, -- Use BYTEA for binary storage
    mime_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_profile_images_profile_id ON profile_images(profile_id);
CREATE INDEX idx_profile_images_created_at ON profile_images(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_profile_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_images_updated_at
    BEFORE UPDATE ON profile_images
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_images_updated_at();

-- Disable RLS for now (we'll re-enable with proper policies later)
ALTER TABLE profile_images DISABLE ROW LEVEL SECURITY;

-- Add constraint to ensure valid mime types
ALTER TABLE profile_images ADD CONSTRAINT valid_mime_type 
    CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png'));

-- Add constraint to ensure reasonable file size (10MB max)
ALTER TABLE profile_images ADD CONSTRAINT reasonable_file_size 
    CHECK (file_size > 0 AND file_size <= 10485760);
