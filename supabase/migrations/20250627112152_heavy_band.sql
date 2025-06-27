/*
  # Drivers and Vehicles Schema

  1. New Tables
    - `drivers`
      - `id` (uuid, primary key, references auth.users)
      - `license_number` (text, unique)
      - `license_expiry` (date)
      - `background_check_status` (enum)
      - `rating` (decimal, default 5.0)
      - `total_rides` (integer, default 0)
      - `is_active` (boolean, default false)
      - `current_location` (point, for real-time tracking)
      - `status` (enum: available, busy, offline)
      - `documents` (jsonb, for storing document references)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `vehicles`
      - `id` (uuid, primary key)
      - `driver_id` (uuid, references drivers)
      - `make` (text)
      - `model` (text)
      - `year` (integer)
      - `color` (text)
      - `license_plate` (text, unique)
      - `vehicle_type` (enum: sedan, hatchback, suv, bike, auto)
      - `fuel_type` (enum: petrol, diesel, electric, hybrid, cng)
      - `is_electric` (boolean, default false)
      - `capacity` (integer, default 4)
      - `insurance_expiry` (date)
      - `registration_expiry` (date)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies for drivers and admin access
*/

-- Create enums
CREATE TYPE background_check_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE driver_status AS ENUM ('available', 'busy', 'offline');
CREATE TYPE vehicle_type AS ENUM ('sedan', 'hatchback', 'suv', 'bike', 'auto');
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'cng');

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number text UNIQUE NOT NULL,
  license_expiry date NOT NULL,
  background_check_status background_check_status DEFAULT 'pending',
  rating decimal(3,2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  total_rides integer DEFAULT 0,
  is_active boolean DEFAULT false,
  current_location point,
  status driver_status DEFAULT 'offline',
  documents jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL CHECK (year >= 1990 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  color text NOT NULL,
  license_plate text UNIQUE NOT NULL,
  vehicle_type vehicle_type NOT NULL,
  fuel_type fuel_type NOT NULL,
  is_electric boolean DEFAULT false,
  capacity integer DEFAULT 4 CHECK (capacity > 0),
  insurance_expiry date NOT NULL,
  registration_expiry date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Drivers policies
CREATE POLICY "Drivers can read own data"
  ON drivers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Drivers can update own data"
  ON drivers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public read access to active drivers"
  ON drivers
  FOR SELECT
  TO authenticated
  USING (is_active = true AND status = 'available');

-- Vehicles policies
CREATE POLICY "Drivers can manage own vehicles"
  ON vehicles
  FOR ALL
  TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "Public read access to active vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Triggers for updated_at
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set is_electric based on fuel_type
CREATE OR REPLACE FUNCTION set_electric_flag()
RETURNS trigger AS $$
BEGIN
  NEW.is_electric = (NEW.fuel_type = 'electric');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_vehicle_electric_flag
  BEFORE INSERT OR UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_electric_flag();