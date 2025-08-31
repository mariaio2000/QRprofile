-- Migration to re-enable RLS with proper policies for profile_images table
-- This ensures security while maintaining all current functionality

-- First, enable RLS on the profile_images table
ALTER TABLE profile_images ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own images" ON profile_images;
DROP POLICY IF EXISTS "Users can manage own images" ON profile_images;
DROP POLICY IF EXISTS "Users can insert own images" ON profile_images;
DROP POLICY IF EXISTS "Users can update own images" ON profile_images;
DROP POLICY IF EXISTS "Users can delete own images" ON profile_images;
DROP POLICY IF EXISTS "Allow authenticated users to manage images" ON profile_images;
DROP POLICY IF EXISTS "Public can view images" ON profile_images;

-- Policy for users to view their own images
CREATE POLICY "Users can view own images" ON profile_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Policy for users to insert their own images
CREATE POLICY "Users can insert own images" ON profile_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Policy for users to update their own images
CREATE POLICY "Users can update own images" ON profile_images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Policy for users to delete their own images
CREATE POLICY "Users can delete own images" ON profile_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Policy for public read access to images (for QR code sharing)
-- This allows anyone to view images, which is necessary for public profile sharing
CREATE POLICY "Public can view images" ON profile_images
    FOR SELECT USING (true);

-- Add a comment explaining the security model
COMMENT ON TABLE profile_images IS 'Profile images with RLS enabled. Users can manage their own images, and images are publicly viewable for QR code sharing.';
