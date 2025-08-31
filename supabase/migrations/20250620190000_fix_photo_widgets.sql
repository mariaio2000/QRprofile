/*
  # Fix photo_widgets column

  This migration ensures the photo_widgets column exists in the profiles table.
  The previous migration may not have been applied correctly.
*/

-- Add photo_widgets column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'photo_widgets'
  ) THEN
    ALTER TABLE profiles ADD COLUMN photo_widgets jsonb DEFAULT '[]';
    RAISE NOTICE 'Added photo_widgets column to profiles table';
  ELSE
    RAISE NOTICE 'photo_widgets column already exists in profiles table';
  END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'photo_widgets';
