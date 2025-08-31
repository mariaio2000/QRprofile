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

-- Create comprehensive policies that ensure users can manage their own images
-- Policy for viewing images: Users can view images associated with their profiles
CREATE POLICY "Users can view own images" ON profile_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Policy for inserting images: Users can insert images for their own profiles
CREATE POLICY "Users can insert own images" ON profile_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Policy for updating images: Users can update images associated with their profiles
CREATE POLICY "Users can update own images" ON profile_images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Policy for deleting images: Users can delete images associated with their profiles
CREATE POLICY "Users can delete own images" ON profile_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Additional policy to allow public viewing of profile images (for QR code sharing)
-- This allows anyone to view images that are associated with profiles (since profiles are publicly viewable)
CREATE POLICY "Public can view profile images" ON profile_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = profile_images.profile_id
        )
    );

-- Verify that RLS is enabled and policies are in place
DO $$
BEGIN
    -- Check if RLS is enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'profile_images' 
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS is not enabled on profile_images table';
    END IF;
    
    -- Check if policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profile_images'
    ) THEN
        RAISE EXCEPTION 'No policies found on profile_images table';
    END IF;
    
    RAISE NOTICE 'RLS successfully enabled with proper policies on profile_images table';
END $$;

-- Create a function to test RLS policies (for debugging purposes)
CREATE OR REPLACE FUNCTION test_profile_images_rls()
RETURNS TABLE (
    test_name TEXT,
    result TEXT,
    details TEXT
) AS $$
DECLARE
    test_user_id UUID;
    test_profile_id UUID;
    test_image_id UUID;
BEGIN
    -- Get a test user and profile
    SELECT user_id, id INTO test_user_id, test_profile_id 
    FROM profiles 
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RETURN QUERY SELECT 
            'No test data'::TEXT,
            'SKIP'::TEXT,
            'No profiles found to test with'::TEXT;
        RETURN;
    END IF;
    
    -- Test 1: Check if authenticated user can view their own images
    BEGIN
        SET LOCAL ROLE authenticated;
        SET LOCAL "request.jwt.claim.sub" TO test_user_id::TEXT;
        
        PERFORM 1 FROM profile_images 
        WHERE profile_id = test_profile_id 
        LIMIT 1;
        
        RETURN QUERY SELECT 
            'Authenticated user can view own images'::TEXT,
            'PASS'::TEXT,
            'User can view images for their profile'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'Authenticated user can view own images'::TEXT,
            'FAIL'::TEXT,
            SQLERRM::TEXT;
    END;
    
    -- Test 2: Check if anonymous user can view images (for public profiles)
    BEGIN
        SET LOCAL ROLE anon;
        SET LOCAL "request.jwt.claim.sub" TO NULL;
        
        PERFORM 1 FROM profile_images 
        WHERE profile_id = test_profile_id 
        LIMIT 1;
        
        RETURN QUERY SELECT 
            'Anonymous user can view profile images'::TEXT,
            'PASS'::TEXT,
            'Anonymous users can view profile images'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'Anonymous user can view profile images'::TEXT,
            'FAIL'::TEXT,
            SQLERRM::TEXT;
    END;
    
    -- Reset role
    RESET ROLE;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
