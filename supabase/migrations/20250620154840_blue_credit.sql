/*
  # Add photo widgets support to profiles

  1. Changes
    - Add `photo_widgets` column to profiles table
    - Column stores array of photo widget objects with id, title, photos array, and layout

  2. Security
    - Existing RLS policies will apply to the new column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'photo_widgets'
  ) THEN
    ALTER TABLE profiles ADD COLUMN photo_widgets jsonb DEFAULT '[]';
  END IF;
END $$;