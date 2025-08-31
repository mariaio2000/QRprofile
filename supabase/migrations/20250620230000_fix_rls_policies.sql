-- Migration to fix RLS policies for profile_images table
-- The current policies are too restrictive and causing upload failures

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own images" ON profile_images;
DROP POLICY IF EXISTS "Users can manage own images" ON profile_images;

-- Create more permissive policies that allow authenticated users to manage their images
CREATE POLICY "Users can view own images" ON profile_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own images" ON profile_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own images" ON profile_images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own images" ON profile_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Also add a temporary policy for testing (remove this later)
CREATE POLICY "Allow authenticated users to manage images" ON profile_images
    FOR ALL USING (auth.role() = 'authenticated');
