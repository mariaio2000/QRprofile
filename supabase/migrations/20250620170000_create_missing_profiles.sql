/*
  # Create missing profiles for all users
  
  This migration ensures that every user in auth.users has a corresponding profile
  in the profiles table. It creates profiles for users who don't have one yet.
*/

-- Create profiles for users who don't have one
INSERT INTO profiles (
  user_id,
  username,
  name,
  title,
  bio,
  email,
  phone,
  location,
  social_links,
  services,
  theme,
  created_at,
  updated_at
)
SELECT 
  au.id as user_id,
  COALESCE(
    -- Try to use email prefix as username, fallback to 'user' + timestamp
    CASE 
      WHEN au.email IS NOT NULL AND au.email != '' 
      THEN LOWER(SPLIT_PART(au.email, '@', 1))
      ELSE 'user' || EXTRACT(EPOCH FROM NOW())::bigint
    END,
    'user' || EXTRACT(EPOCH FROM NOW())::bigint
  ) as username,
  COALESCE(
    au.raw_user_meta_data->>'name',
    au.email,
    'User'
  ) as name,
  '' as title,
  '' as bio,
  COALESCE(au.email, '') as email,
  NULL as phone,
  NULL as location,
  '{}'::jsonb as social_links,
  '[]'::jsonb as services,
  '{"primary": "#8B5CF6", "secondary": "#EC4899", "accent": "#F97316"}'::jsonb as theme,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
  AND au.id IS NOT NULL;

-- Update usernames to ensure uniqueness
-- If there are duplicate usernames, append a number
WITH duplicate_usernames AS (
  SELECT username, COUNT(*) as count
  FROM profiles
  GROUP BY username
  HAVING COUNT(*) > 1
),
numbered_profiles AS (
  SELECT 
    id,
    username,
    ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at) as rn
  FROM profiles p
  WHERE EXISTS (
    SELECT 1 FROM duplicate_usernames d 
    WHERE d.username = p.username
  )
)
UPDATE profiles 
SET username = numbered_profiles.username || '_' || (numbered_profiles.rn - 1)
FROM numbered_profiles
WHERE profiles.id = numbered_profiles.id
  AND numbered_profiles.rn > 1;

-- Add unique constraint on username if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_username_key' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;
