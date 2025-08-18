/*
  # Create profiles table for QR Profile App

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `username` (text, unique)
      - `name` (text)
      - `title` (text)
      - `bio` (text)
      - `profile_image` (text)
      - `email` (text)
      - `phone` (text, nullable)
      - `location` (text, nullable)
      - `social_links` (jsonb)
      - `services` (jsonb)
      - `theme` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for users to manage their own profiles
    - Add policy for public read access to profiles
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username text UNIQUE NOT NULL,
  name text NOT NULL,
  title text DEFAULT '',
  bio text DEFAULT '',
  profile_image text DEFAULT 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=400',
  email text NOT NULL,
  phone text,
  location text,
  social_links jsonb DEFAULT '{}',
  services jsonb DEFAULT '[]',
  theme jsonb DEFAULT '{"primary": "#8B5CF6", "secondary": "#EC4899", "accent": "#F97316"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to read and write their own profiles
CREATE POLICY "Users can manage own profile"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for public read access to profiles (for QR code sharing)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on username for fast lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);

-- Create index on user_id for fast user profile lookups
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);