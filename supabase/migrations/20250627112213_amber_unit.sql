/*
  # Rides and Bookings Schema

  1. New Tables
    - `rides`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `driver_id` (uuid, references drivers, nullable initially)
      - `vehicle_id` (uuid, references vehicles, nullable initially)
      - `pickup_location` (text, encrypted location reference)
      - `pickup_coordinates` (point, for matching)
      - `destination_location` (text)
      - `destination_coordinates` (point)
      - `ride_type` (enum: standard, premium, shared, bike, auto)
      - `status` (enum: requested, matched, accepted, started, completed, cancelled)
      - `fare_estimate` (decimal)
      - `final_fare` (decimal, nullable)
      - `distance_km` (decimal)
      - `duration_minutes` (integer)
      - `payment_method` (enum: cash, upi, card, wallet, crypto)
      - `payment_status` (enum: pending, completed, failed, refunded)
      - `ride_coins_earned` (integer, default 0)
      - `ride_coins_used` (integer, default 0)
      - `carbon_credits_earned` (decimal, default 0)
      - `privacy_mode` (boolean, default true)
      - `emergency_contacts_notified` (boolean, default false)
      - `route_data` (jsonb, for storing route information)
      - `safety_metrics` (jsonb, for AI monitoring data)
      - `requested_at` (timestamp)
      - `started_at` (timestamp, nullable)
      - `completed_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `ride_ratings`
      - `id` (uuid, primary key)
      - `ride_id` (uuid, references rides)
      - `user_id` (uuid, references user_profiles)
      - `driver_id` (uuid, references drivers)
      - `user_rating` (integer, 1-5)
      - `driver_rating` (integer, 1-5)
      - `user_feedback` (text, optional)
      - `driver_feedback` (text, optional)
      - `safety_rating` (integer, 1-5)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users and drivers to access their rides
    - Implement privacy-first access controls
*/

-- Create enums
CREATE TYPE ride_type AS ENUM ('standard', 'premium', 'shared', 'bike', 'auto');
CREATE TYPE ride_status AS ENUM ('requested', 'matched', 'accepted', 'started', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'card', 'wallet', 'crypto');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Rides table
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  pickup_location text NOT NULL,
  pickup_coordinates point NOT NULL,
  destination_location text NOT NULL,
  destination_coordinates point NOT NULL,
  ride_type ride_type DEFAULT 'standard',
  status ride_status DEFAULT 'requested',
  fare_estimate decimal(10,2) NOT NULL,
  final_fare decimal(10,2),
  distance_km decimal(8,2),
  duration_minutes integer,
  payment_method payment_method DEFAULT 'upi',
  payment_status payment_status DEFAULT 'pending',
  ride_coins_earned integer DEFAULT 0,
  ride_coins_used integer DEFAULT 0,
  carbon_credits_earned decimal(8,2) DEFAULT 0,
  privacy_mode boolean DEFAULT true,
  emergency_contacts_notified boolean DEFAULT false,
  route_data jsonb DEFAULT '{}',
  safety_metrics jsonb DEFAULT '{}',
  requested_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ride ratings table
CREATE TABLE IF NOT EXISTS ride_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  driver_rating integer CHECK (driver_rating >= 1 AND driver_rating <= 5),
  user_feedback text,
  driver_feedback text,
  safety_rating integer CHECK (safety_rating >= 1 AND safety_rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_ratings ENABLE ROW LEVEL SECURITY;

-- Rides policies
CREATE POLICY "Users can read own rides"
  ON rides
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Drivers can read assigned rides"
  ON rides
  FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid());

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

CREATE POLICY "Drivers can update assigned rides"
  ON rides
  FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid());

-- Ride ratings policies
CREATE POLICY "Users can manage ratings for their rides"
  ON ride_ratings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR driver_id = auth.uid());

-- Triggers
CREATE TRIGGER update_rides_updated_at
  BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate ride coins based on fare and vehicle type
CREATE OR REPLACE FUNCTION calculate_ride_coins(fare decimal, is_electric boolean)
RETURNS integer AS $$
BEGIN
  -- Base coins: 1 coin per ₹10 spent
  -- Electric vehicle bonus: 50% extra coins
  IF is_electric THEN
    RETURN FLOOR(fare / 10 * 1.5);
  ELSE
    RETURN FLOOR(fare / 10);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate carbon credits for electric vehicles
CREATE OR REPLACE FUNCTION calculate_carbon_credits(distance_km decimal, is_electric boolean)
RETURNS decimal AS $$
BEGIN
  -- Award carbon credits only for electric vehicles
  -- 0.1 credits per km for electric rides
  IF is_electric THEN
    RETURN distance_km * 0.1;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update ride completion
CREATE OR REPLACE FUNCTION complete_ride()
RETURNS trigger AS $$
DECLARE
  vehicle_electric boolean;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get vehicle electric status
    SELECT is_electric INTO vehicle_electric
    FROM vehicles
    WHERE id = NEW.vehicle_id;
    
    -- Calculate and update ride coins and carbon credits
    NEW.ride_coins_earned = calculate_ride_coins(NEW.final_fare, vehicle_electric);
    NEW.carbon_credits_earned = calculate_carbon_credits(NEW.distance_km, vehicle_electric);
    NEW.completed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_ride_completion
  BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION complete_ride();