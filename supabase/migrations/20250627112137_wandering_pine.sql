/*
  # User Profiles and Authentication Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `phone` (text, unique)
      - `avatar_url` (text, optional)
      - `date_of_birth` (date, optional)
      - `emergency_contact_name` (text, optional)
      - `emergency_contact_phone` (text, optional)
      - `preferred_language` (text, default 'en')
      - `is_verified` (boolean, default false)
      - `verification_documents` (jsonb, for storing document references)
      - `privacy_settings` (jsonb, for zero-knowledge preferences)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for users to read/update their own profiles
    - Add policy for public read access to basic profile info (name, avatar)
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text UNIQUE,
  avatar_url text,
  date_of_birth date,
  emergency_contact_name text,
  emergency_contact_phone text,
  preferred_language text DEFAULT 'en',
  is_verified boolean DEFAULT false,
  verification_documents jsonb DEFAULT '{}',
  privacy_settings jsonb DEFAULT '{
    "location_sharing": false,
    "trip_sharing": true,
    "data_analytics": false,
    "marketing_communications": false
  }',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Public read access to basic profile info (for ride sharing)
CREATE POLICY "Public read access to basic profile info"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();