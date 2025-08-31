-- Migration to verify profile_images table structure
-- This migration will help us debug the image upload issue

-- Check if the table exists and show its structure
DO $$
BEGIN
    -- Check if profile_images table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profile_images') THEN
        RAISE NOTICE 'profile_images table exists';
        
        -- Show table structure
        RAISE NOTICE 'Table structure:';
        FOR r IN (
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'profile_images'
            ORDER BY ordinal_position
        ) LOOP
            RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
                r.column_name, r.data_type, r.is_nullable, r.column_default;
        END LOOP;
        
        -- Check RLS policies
        RAISE NOTICE 'RLS Policies:';
        FOR r IN (
            SELECT policyname, permissive, roles, cmd, qual
            FROM pg_policies 
            WHERE tablename = 'profile_images'
        ) LOOP
            RAISE NOTICE 'Policy: %, Permissive: %, Roles: %, Command: %', 
                r.policyname, r.permissive, r.roles, r.cmd;
        END LOOP;
        
        -- Count existing records
        EXECUTE 'SELECT COUNT(*) FROM profile_images' INTO r;
        RAISE NOTICE 'Existing records: %', r;
        
    ELSE
        RAISE NOTICE 'profile_images table does NOT exist!';
    END IF;
END $$;

-- Check if profiles table has the profile_image_id column
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'profile_image_id'
    ) THEN
        RAISE NOTICE 'profiles table has profile_image_id column';
    ELSE
        RAISE NOTICE 'profiles table does NOT have profile_image_id column!';
    END IF;
END $$;

-- Test inserting a small image record to verify the table works
DO $$
DECLARE
    test_profile_id uuid;
    test_image_id uuid;
BEGIN
    -- Get a test profile ID
    SELECT id INTO test_profile_id FROM profiles LIMIT 1;
    
    IF test_profile_id IS NOT NULL THEN
        RAISE NOTICE 'Found test profile ID: %', test_profile_id;
        
        -- Try to insert a test image record
        INSERT INTO profile_images (
            profile_id, 
            image_data, 
            mime_type, 
            file_name, 
            file_size
        ) VALUES (
            test_profile_id,
            E'\\x89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de'::bytea,
            'image/png',
            'test.png',
            67
        ) RETURNING id INTO test_image_id;
        
        RAISE NOTICE 'Successfully inserted test image with ID: %', test_image_id;
        
        -- Clean up test record
        DELETE FROM profile_images WHERE id = test_image_id;
        RAISE NOTICE 'Cleaned up test image record';
        
    ELSE
        RAISE NOTICE 'No profiles found to test with';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error testing image insert: %', SQLERRM;
END $$;
