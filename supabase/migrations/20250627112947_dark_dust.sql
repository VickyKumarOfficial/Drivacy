/*
  # Drivers and Vehicles Schema

  1. New Tables
    - `drivers`
      - Driver-specific information and verification
      - Background check status and ratings
      - Current location and availability status
    - `vehicles`
      - Vehicle information linked to drivers
      - Electric vehicle tracking for carbon credits
      - Insurance and registration details

  2. Security
    - Enable RLS on both tables
    - Policies for drivers to manage their own data
    - Public read access for active drivers/vehicles

  3. Features
    - Support for multiple vehicles per driver
    - Electric vehicle identification for eco-rewards
    - Real-time location and status tracking
*/

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number text UNIQUE NOT NULL,
  license_expiry date NOT NULL,
  background_check_status text DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'approved', 'rejected', 'expired')),
  rating numeric(3,2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  total_rides integer DEFAULT 0,
  is_active boolean DEFAULT true,
  current_location jsonb,
  status text DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'offline')),
  documents jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL CHECK (year >= 1990 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  color text NOT NULL,
  license_plate text UNIQUE NOT NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('sedan', 'hatchback', 'suv', 'bike', 'auto')),
  fuel_type text NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'cng')),
  is_electric boolean GENERATED ALWAYS AS (fuel_type IN ('electric', 'hybrid')) STORED,
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

CREATE POLICY "Public can read active drivers"
  ON drivers
  FOR SELECT
  TO authenticated
  USING (is_active = true AND background_check_status = 'approved');

-- Vehicles policies
CREATE POLICY "Drivers can manage own vehicles"
  ON vehicles
  FOR ALL
  TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "Public can read active vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Add updated_at triggers
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();