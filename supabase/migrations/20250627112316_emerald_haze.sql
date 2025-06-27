/*
  # Offers and Promotions Schema

  1. New Tables
    - `offers`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `offer_type` (enum: percentage, fixed_amount, ride_coins, first_ride_free)
      - `discount_value` (decimal)
      - `discount_percentage` (integer)
      - `max_discount` (decimal, optional)
      - `min_ride_amount` (decimal, optional)
      - `promo_code` (text, unique)
      - `usage_limit` (integer, optional)
      - `usage_count` (integer, default 0)
      - `user_usage_limit` (integer, default 1)
      - `applicable_ride_types` (text[], array of ride types)
      - `applicable_cities` (text[], optional)
      - `is_active` (boolean, default true)
      - `valid_from` (timestamp)
      - `valid_until` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_offer_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `offer_id` (uuid, references offers)
      - `ride_id` (uuid, references rides)
      - `discount_applied` (decimal)
      - `used_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access to active offers
    - Add policies for users to track their offer usage
*/

-- Create enums
CREATE TYPE offer_type AS ENUM ('percentage', 'fixed_amount', 'ride_coins', 'first_ride_free');

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  offer_type offer_type NOT NULL,
  discount_value decimal(10,2) DEFAULT 0,
  discount_percentage integer DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  max_discount decimal(10,2),
  min_ride_amount decimal(10,2) DEFAULT 0,
  promo_code text UNIQUE NOT NULL,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  user_usage_limit integer DEFAULT 1,
  applicable_ride_types text[] DEFAULT ARRAY['standard', 'premium', 'shared', 'bike', 'auto'],
  applicable_cities text[],
  is_active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User offer usage table
CREATE TABLE IF NOT EXISTS user_offer_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  offer_id uuid REFERENCES offers(id) ON DELETE CASCADE,
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  discount_applied decimal(10,2) NOT NULL,
  used_at timestamptz DEFAULT now(),
  UNIQUE(user_id, offer_id, ride_id)
);

-- Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_offer_usage ENABLE ROW LEVEL SECURITY;

-- Offers policies
CREATE POLICY "Public read access to active offers"
  ON offers
  FOR SELECT
  TO authenticated
  USING (is_active = true AND valid_from <= now() AND valid_until >= now());

-- User offer usage policies
CREATE POLICY "Users can read own offer usage"
  ON user_offer_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create offer usage records"
  ON user_offer_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Triggers
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate offer usage
CREATE OR REPLACE FUNCTION validate_offer_usage(
  p_user_id uuid,
  p_offer_id uuid,
  p_ride_amount decimal
)
RETURNS jsonb AS $$
DECLARE
  offer_record offers%ROWTYPE;
  user_usage_count integer;
  total_usage_count integer;
  discount_amount decimal;
  result jsonb;
BEGIN
  -- Get offer details
  SELECT * INTO offer_record
  FROM offers
  WHERE id = p_offer_id
    AND is_active = true
    AND valid_from <= now()
    AND valid_until >= now();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Offer not found or expired');
  END IF;
  
  -- Check minimum ride amount
  IF p_ride_amount < offer_record.min_ride_amount THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Minimum ride amount not met');
  END IF;
  
  -- Check user usage limit
  SELECT COUNT(*) INTO user_usage_count
  FROM user_offer_usage
  WHERE user_id = p_user_id AND offer_id = p_offer_id;
  
  IF user_usage_count >= offer_record.user_usage_limit THEN
    RETURN jsonb_build_object('valid', false, 'error', 'User usage limit exceeded');
  END IF;
  
  -- Check total usage limit
  IF offer_record.usage_limit IS NOT NULL THEN
    SELECT usage_count INTO total_usage_count
    FROM offers
    WHERE id = p_offer_id;
    
    IF total_usage_count >= offer_record.usage_limit THEN
      RETURN jsonb_build_object('valid', false, 'error', 'Offer usage limit exceeded');
    END IF;
  END IF;
  
  -- Calculate discount
  IF offer_record.offer_type = 'percentage' THEN
    discount_amount = p_ride_amount * (offer_record.discount_percentage / 100.0);
    IF offer_record.max_discount IS NOT NULL THEN
      discount_amount = LEAST(discount_amount, offer_record.max_discount);
    END IF;
  ELSIF offer_record.offer_type = 'fixed_amount' THEN
    discount_amount = offer_record.discount_value;
  ELSIF offer_record.offer_type = 'first_ride_free' THEN
    discount_amount = p_ride_amount;
  ELSE
    discount_amount = 0;
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'discount_amount', discount_amount,
    'offer_title', offer_record.title
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample offers
INSERT INTO offers (title, description, offer_type, discount_percentage, promo_code, valid_until) VALUES
('First Ride Free', 'Welcome to Drivacy! Your first ride is on us.', 'first_ride_free', 100, 'WELCOME100', now() + interval '30 days'),
('Weekend Special', 'Save big on weekend rides with friends.', 'percentage', 25, 'WEEKEND25', now() + interval '7 days'),
('Electric Rides', 'Go green and save more with electric vehicles.', 'percentage', 15, 'GOGREEN15', now() + interval '14 days');

INSERT INTO offers (title, description, offer_type, discount_value, max_discount, min_ride_amount, promo_code, valid_until) VALUES
('Flat ₹50 Off', 'Get flat ₹50 off on rides above ₹200', 'fixed_amount', 50, NULL, 200, 'FLAT50', now() + interval '10 days');