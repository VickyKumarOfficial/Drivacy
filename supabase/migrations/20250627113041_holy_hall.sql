/*
  # Offers and Promotions System

  1. New Tables
    - `offers`
      - Promotional offers and discount codes
      - Usage tracking and limitations
      - Flexible discount types
    - `user_offer_usage`
      - Track individual user offer usage
      - Prevent abuse and ensure fair usage

  2. Security
    - Enable RLS for offer management
    - Public read access for active offers
    - Usage tracking for fraud prevention

  3. Features
    - Multiple discount types (percentage, fixed, free rides)
    - Usage limits per user and globally
    - City and ride type restrictions
    - Automatic expiration handling
*/

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  offer_type text NOT NULL CHECK (offer_type IN ('percentage', 'fixed_amount', 'ride_coins', 'first_ride_free')),
  discount_value numeric(10,2) DEFAULT 0 CHECK (discount_value >= 0),
  discount_percentage numeric(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  max_discount numeric(10,2),
  min_ride_amount numeric(10,2) DEFAULT 0 CHECK (min_ride_amount >= 0),
  promo_code text UNIQUE NOT NULL,
  usage_limit integer, -- NULL means unlimited
  usage_count integer DEFAULT 0 CHECK (usage_count >= 0),
  user_usage_limit integer DEFAULT 1 CHECK (user_usage_limit > 0),
  applicable_ride_types text[] DEFAULT ARRAY['standard', 'premium', 'shared', 'bike', 'auto'],
  applicable_cities text[], -- NULL means all cities
  is_active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_discount CHECK (
    (offer_type = 'percentage' AND discount_percentage > 0) OR
    (offer_type = 'fixed_amount' AND discount_value > 0) OR
    (offer_type = 'ride_coins' AND discount_value > 0) OR
    (offer_type = 'first_ride_free')
  ),
  CONSTRAINT valid_dates CHECK (valid_until > valid_from),
  CONSTRAINT valid_usage_limit CHECK (usage_limit IS NULL OR usage_limit > 0)
);

-- Create user_offer_usage table
CREATE TABLE IF NOT EXISTS user_offer_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id uuid REFERENCES offers(id) ON DELETE CASCADE,
  ride_id uuid REFERENCES rides(id) ON DELETE SET NULL,
  discount_applied numeric(10,2) NOT NULL CHECK (discount_applied >= 0),
  used_at timestamptz DEFAULT now(),
  
  -- Ensure one usage per user per offer (for single-use offers)
  UNIQUE(user_id, offer_id)
);

-- Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_offer_usage ENABLE ROW LEVEL SECURITY;

-- Offers policies
CREATE POLICY "Public can read active offers"
  ON offers
  FOR SELECT
  TO authenticated
  USING (is_active = true AND valid_until > now());

CREATE POLICY "Admins can manage offers"
  ON offers
  FOR ALL
  TO authenticated
  USING (false); -- Will be updated when admin roles are implemented

-- User offer usage policies
CREATE POLICY "Users can read own offer usage"
  ON user_offer_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create offer usage"
  ON user_offer_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add updated_at trigger for offers
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to validate offer usage
CREATE OR REPLACE FUNCTION validate_offer_usage(
  p_user_id uuid,
  p_offer_id uuid,
  p_ride_amount numeric
)
RETURNS jsonb AS $$
DECLARE
  offer_record offers%ROWTYPE;
  user_usage_count integer;
  calculated_discount numeric;
BEGIN
  -- Get offer details
  SELECT * INTO offer_record
  FROM offers
  WHERE id = p_offer_id
    AND is_active = true
    AND valid_from <= now()
    AND valid_until > now();
  
  -- Check if offer exists and is valid
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Offer not found or expired'
    );
  END IF;
  
  -- Check global usage limit
  IF offer_record.usage_limit IS NOT NULL AND offer_record.usage_count >= offer_record.usage_limit THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Offer usage limit exceeded'
    );
  END IF;
  
  -- Check minimum ride amount
  IF p_ride_amount < offer_record.min_ride_amount THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Minimum ride amount not met'
    );
  END IF;
  
  -- Check user usage limit
  SELECT COUNT(*) INTO user_usage_count
  FROM user_offer_usage
  WHERE user_id = p_user_id AND offer_id = p_offer_id;
  
  IF user_usage_count >= offer_record.user_usage_limit THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'User usage limit exceeded'
    );
  END IF;
  
  -- Calculate discount
  CASE offer_record.offer_type
    WHEN 'percentage' THEN
      calculated_discount := p_ride_amount * (offer_record.discount_percentage / 100);
      IF offer_record.max_discount IS NOT NULL THEN
        calculated_discount := LEAST(calculated_discount, offer_record.max_discount);
      END IF;
    WHEN 'fixed_amount' THEN
      calculated_discount := LEAST(offer_record.discount_value, p_ride_amount);
    WHEN 'first_ride_free' THEN
      calculated_discount := p_ride_amount;
    WHEN 'ride_coins' THEN
      calculated_discount := offer_record.discount_value; -- This would be handled differently in the app
    ELSE
      calculated_discount := 0;
  END CASE;
  
  RETURN jsonb_build_object(
    'valid', true,
    'discount_amount', calculated_discount,
    'offer_type', offer_record.offer_type,
    'promo_code', offer_record.promo_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample offers
INSERT INTO offers (title, description, offer_type, discount_percentage, max_discount, promo_code, user_usage_limit, valid_until) VALUES
('First Ride Free', 'Welcome to Drivacy! Your first ride is on us.', 'first_ride_free', 0, 500, 'WELCOME100', 1, '2024-12-31 23:59:59'),
('Weekend Special', 'Save big on weekend rides with friends.', 'percentage', 25, 200, 'WEEKEND25', 5, '2024-12-31 23:59:59'),
('Electric Rides', 'Go green and save more with electric vehicles.', 'percentage', 15, 150, 'GOGREEN15', 10, '2024-12-31 23:59:59'),
('Flat ₹50 Off', 'Flat discount on rides above ₹200.', 'fixed_amount', 0, NULL, 'FLAT50', 3, '2024-12-31 23:59:59');

-- Update discount_value for fixed amount offers
UPDATE offers SET discount_value = 50 WHERE promo_code = 'FLAT50';
UPDATE offers SET min_ride_amount = 200 WHERE promo_code = 'FLAT50';