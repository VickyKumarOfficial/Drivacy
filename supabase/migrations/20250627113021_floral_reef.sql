/*
  # Wallet and Transactions System

  1. New Tables
    - `user_wallets`
      - User wallet with balance, RideCoins, and carbon credits
      - Comprehensive financial tracking
    - `wallet_transactions`
      - Detailed transaction history
      - Support for multiple payment methods
      - RideCoins and carbon credits tracking

  2. Security
    - Enable RLS for user-specific wallet access
    - Secure transaction recording
    - Balance integrity constraints

  3. Features
    - Multi-currency support (INR, RideCoins, Carbon Credits)
    - Transaction categorization
    - Real-time balance updates
*/

-- Create user_wallets table
CREATE TABLE IF NOT EXISTS user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(12,2) DEFAULT 0.00 CHECK (balance >= 0),
  ride_coins integer DEFAULT 0 CHECK (ride_coins >= 0),
  carbon_credits integer DEFAULT 0 CHECK (carbon_credits >= 0),
  total_earned numeric(12,2) DEFAULT 0.00 CHECK (total_earned >= 0),
  total_spent numeric(12,2) DEFAULT 0.00 CHECK (total_spent >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id uuid REFERENCES user_wallets(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  category text NOT NULL CHECK (category IN ('ride_payment', 'wallet_topup', 'refund', 'bonus', 'cashback', 'ride_coins_redemption')),
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  ride_coins_change integer DEFAULT 0,
  carbon_credits_change integer DEFAULT 0,
  description text NOT NULL,
  reference_id uuid, -- Reference to ride_id or other entities
  payment_method text DEFAULT 'wallet' CHECK (payment_method IN ('cash', 'upi', 'card', 'wallet', 'crypto')),
  transaction_id text, -- External payment gateway transaction ID
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Wallet policies
CREATE POLICY "Users can read own wallet"
  ON user_wallets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own wallet"
  ON user_wallets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Transaction policies
CREATE POLICY "Users can read own transactions"
  ON wallet_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create transactions"
  ON wallet_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add updated_at trigger for wallets
CREATE TRIGGER update_user_wallets_updated_at
  BEFORE UPDATE ON user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create wallet for new users
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_wallets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create wallet on user profile creation
CREATE OR REPLACE TRIGGER on_user_profile_created
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- Function to update wallet balance after transaction
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE user_wallets 
    SET 
      balance = CASE 
        WHEN NEW.type = 'credit' THEN balance + NEW.amount
        WHEN NEW.type = 'debit' THEN balance - NEW.amount
        ELSE balance
      END,
      ride_coins = ride_coins + NEW.ride_coins_change,
      carbon_credits = carbon_credits + NEW.carbon_credits_change,
      total_earned = CASE 
        WHEN NEW.type = 'credit' THEN total_earned + NEW.amount
        ELSE total_earned
      END,
      total_spent = CASE 
        WHEN NEW.type = 'debit' THEN total_spent + NEW.amount
        ELSE total_spent
      END,
      updated_at = now()
    WHERE id = NEW.wallet_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update wallet on transaction completion
CREATE TRIGGER update_wallet_on_transaction
  AFTER INSERT OR UPDATE ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_balance();