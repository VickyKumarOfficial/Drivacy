/*
  # User Profiles Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `phone` (text, nullable)
      - `avatar_url` (text, nullable)
      - `date_of_birth` (date, nullable)
      - `emergency_contact_name` (text, nullable)
      - `emergency_contact_phone` (text, nullable)
      - `preferred_language` (text, default 'en')
      - `is_verified` (boolean, default false)
      - `verification_documents` (jsonb, nullable)
      - `privacy_settings` (jsonb, default privacy settings)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for users to read/update their own profiles
    - Add policy for authenticated users to read basic profile info of others

  3. Functions
    - Trigger to create user profile on auth.users insert
    - Function to update updated_at timestamp
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  date_of_birth date,
  emergency_contact_name text,
  emergency_contact_phone text,
  preferred_language text DEFAULT 'en',
  is_verified boolean DEFAULT false,
  verification_documents jsonb,
  privacy_settings jsonb DEFAULT '{
    "location_sharing": false,
    "ride_history_visible": true,
    "emergency_contacts_auto_notify": true,
    "data_analytics_opt_in": false
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
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

CREATE POLICY "Users can read basic info of others"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();