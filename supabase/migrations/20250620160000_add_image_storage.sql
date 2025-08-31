/*
  # Add binary image storage to profiles

  1. New Tables
    - `profile_images` table for storing binary image data
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `image_data` (bytea) - binary image data
      - `mime_type` (text) - image MIME type (image/jpeg, image/png, etc.)
      - `file_name` (text) - original filename
      - `file_size` (integer) - file size in bytes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to profiles table
    - Add `profile_image_id` (uuid, references profile_images) to replace profile_image URL
    - Add `photos` (jsonb) array of image IDs for photo gallery

  3. Security
    - Enable RLS on `profile_images` table
    - Add policies for users to manage their own images
    - Add policy for public read access to images
*/

-- Create profile_images table for binary storage
CREATE TABLE IF NOT EXISTS profile_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_data bytea NOT NULL,
  mime_type text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on profile_images
ALTER TABLE profile_images ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own images
DROP POLICY IF EXISTS "Users can manage own images" ON profile_images;
CREATE POLICY "Users can manage own images"
  ON profile_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_images.profile_id 
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_images.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Policy for public read access to images
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON profile_images;
CREATE POLICY "Public images are viewable by everyone"
  ON profile_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add profile_image_id column to profiles table (nullable to avoid circular dependency)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image_id uuid REFERENCES profile_images(id) ON DELETE SET NULL;

-- Add photos column to profiles table (array of image IDs)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]';

-- Create indexes for performance
DROP INDEX IF EXISTS profile_images_profile_id_idx;
CREATE INDEX profile_images_profile_id_idx ON profile_images(profile_id);

DROP INDEX IF EXISTS profile_images_created_at_idx;
CREATE INDEX profile_images_created_at_idx ON profile_images(created_at);

-- Function to automatically update updated_at timestamp for profile_images
CREATE OR REPLACE FUNCTION update_profile_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for profile_images
DROP TRIGGER IF EXISTS update_profile_images_updated_at ON profile_images;
CREATE TRIGGER update_profile_images_updated_at
  BEFORE UPDATE ON profile_images
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_images_updated_at();

-- Add check constraint to ensure valid MIME types
ALTER TABLE profile_images DROP CONSTRAINT IF EXISTS valid_mime_type;
ALTER TABLE profile_images ADD CONSTRAINT valid_mime_type 
  CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png'));

-- Add check constraint for reasonable file size (max 10MB)
ALTER TABLE profile_images DROP CONSTRAINT IF EXISTS reasonable_file_size;
ALTER TABLE profile_images ADD CONSTRAINT reasonable_file_size 
  CHECK (file_size > 0 AND file_size <= 10485760);
