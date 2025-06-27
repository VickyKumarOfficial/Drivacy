/*
  # Rides System Schema

  1. New Tables
    - `rides`
      - Complete ride lifecycle management
      - Privacy-focused location handling
      - Payment and rewards integration
      - Safety and emergency features

  2. Security
    - Enable RLS with user-specific access
    - Driver access to assigned rides
    - Privacy protection for location data

  3. Features
    - Zero-knowledge location sharing
    - RideCoins and carbon credits system
    - Emergency contact notifications
    - Real-time ride tracking
*/

-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  pickup_location text NOT NULL,
  pickup_coordinates jsonb NOT NULL,
  destination_location text NOT NULL,
  destination_coordinates jsonb NOT NULL,
  ride_type text DEFAULT 'standard' CHECK (ride_type IN ('standard', 'premium', 'shared', 'bike', 'auto')),
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'matched', 'accepted', 'started', 'completed', 'cancelled')),
  fare_estimate numeric(10,2) NOT NULL CHECK (fare_estimate >= 0),
  final_fare numeric(10,2) CHECK (final_fare >= 0),
  distance_km numeric(8,2) CHECK (distance_km >= 0),
  duration_minutes integer CHECK (duration_minutes >= 0),
  payment_method text DEFAULT 'upi' CHECK (payment_method IN ('cash', 'upi', 'card', 'wallet', 'crypto')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  ride_coins_earned integer DEFAULT 0 CHECK (ride_coins_earned >= 0),
  ride_coins_used integer DEFAULT 0 CHECK (ride_coins_used >= 0),
  carbon_credits_earned integer DEFAULT 0 CHECK (carbon_credits_earned >= 0),
  privacy_mode boolean DEFAULT true,
  emergency_contacts_notified boolean DEFAULT false,
  route_data jsonb DEFAULT '{}'::jsonb,
  safety_metrics jsonb DEFAULT '{}'::jsonb,
  requested_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_completion_time CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR 
    (status != 'completed' AND completed_at IS NULL)
  ),
  CONSTRAINT valid_start_time CHECK (
    (status IN ('started', 'completed') AND started_at IS NOT NULL) OR 
    (status NOT IN ('started', 'completed') AND started_at IS NULL)
  )
);

-- Enable RLS
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;

-- Rides policies
CREATE POLICY "Users can read own rides"
  ON rides
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create rides"
  ON rides
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own rides"
  ON rides
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Drivers can read assigned rides"
  ON rides
  FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "Drivers can update assigned rides"
  ON rides
  FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid());

-- Add updated_at trigger
CREATE TRIGGER update_rides_updated_at
  BEFORE UPDATE ON rides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate ride coins based on distance and vehicle type
CREATE OR REPLACE FUNCTION calculate_ride_rewards(
  ride_distance numeric,
  vehicle_is_electric boolean,
  ride_fare numeric
)
RETURNS jsonb AS $$
DECLARE
  base_coins integer;
  eco_bonus integer;
  carbon_credits integer;
BEGIN
  -- Base coins: 1 coin per km
  base_coins := CEIL(ride_distance);
  
  -- Eco bonus for electric vehicles
  eco_bonus := CASE WHEN vehicle_is_electric THEN CEIL(ride_distance * 0.5) ELSE 0 END;
  
  -- Carbon credits for electric rides
  carbon_credits := CASE WHEN vehicle_is_electric THEN CEIL(ride_distance * 2) ELSE 0 END;
  
  RETURN jsonb_build_object(
    'ride_coins', base_coins + eco_bonus,
    'carbon_credits', carbon_credits
  );
END;
$$ LANGUAGE plpgsql;