/*
  # Wallet and Transactions Schema

  1. New Tables
    - `user_wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles, unique)
      - `balance` (decimal, default 0)
      - `ride_coins` (integer, default 0)
      - `carbon_credits` (decimal, default 0)
      - `total_earned` (decimal, default 0)
      - `total_spent` (decimal, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `wallet_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `wallet_id` (uuid, references user_wallets)
      - `type` (enum: credit, debit)
      - `category` (enum: ride_payment, wallet_topup, refund, bonus, cashback)
      - `amount` (decimal)
      - `ride_coins_change` (integer, default 0)
      - `carbon_credits_change` (decimal, default 0)
      - `description` (text)
      - `reference_id` (uuid, optional - for ride_id or other references)
      - `payment_method` (enum: upi, card, cash, bank_transfer, crypto)
      - `transaction_id` (text, unique - external payment gateway ID)
      - `status` (enum: pending, completed, failed, cancelled)
      - `metadata` (jsonb, for additional transaction data)
      - `created_at` (timestamp)

    - `payment_methods`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `type` (enum: card, upi, bank_account, crypto_wallet)
      - `provider` (text, e.g., 'razorpay', 'stripe', 'upi')
      - `identifier` (text, encrypted card/account identifier)
      - `display_name` (text, e.g., '**** 1234')
      - `is_default` (boolean, default false)
      - `is_active` (boolean, default true)
      - `metadata` (jsonb, for storing encrypted payment details)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own wallet data
    - Implement secure transaction handling
*/

-- Create enums
CREATE TYPE transaction_type AS ENUM ('credit', 'debit');
CREATE TYPE transaction_category AS ENUM ('ride_payment', 'wallet_topup', 'refund', 'bonus', 'cashback', 'ride_coins_redemption');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE payment_method_type AS ENUM ('card', 'upi', 'bank_account', 'crypto_wallet');

-- User wallets table
CREATE TABLE IF NOT EXISTS user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  balance decimal(12,2) DEFAULT 0 CHECK (balance >= 0),
  ride_coins integer DEFAULT 0 CHECK (ride_coins >= 0),
  carbon_credits decimal(10,2) DEFAULT 0 CHECK (carbon_credits >= 0),
  total_earned decimal(12,2) DEFAULT 0,
  total_spent decimal(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  wallet_id uuid REFERENCES user_wallets(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  category transaction_category NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  ride_coins_change integer DEFAULT 0,
  carbon_credits_change decimal(10,2) DEFAULT 0,
  description text NOT NULL,
  reference_id uuid,
  payment_method payment_method DEFAULT 'upi',
  transaction_id text UNIQUE,
  status transaction_status DEFAULT 'pending',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  type payment_method_type NOT NULL,
  provider text NOT NULL,
  identifier text NOT NULL, -- encrypted
  display_name text NOT NULL,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- User wallets policies
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

-- Wallet transactions policies
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

-- Payment methods policies
CREATE POLICY "Users can manage own payment methods"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Triggers
CREATE TRIGGER update_user_wallets_updated_at
  BEFORE UPDATE ON user_wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create wallet on user profile creation
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_wallets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create wallet when user profile is created
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- Function to update wallet balance on transaction
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF NEW.type = 'credit' THEN
      UPDATE user_wallets
      SET 
        balance = balance + NEW.amount,
        ride_coins = ride_coins + NEW.ride_coins_change,
        carbon_credits = carbon_credits + NEW.carbon_credits_change,
        total_earned = total_earned + NEW.amount,
        updated_at = now()
      WHERE id = NEW.wallet_id;
    ELSE
      UPDATE user_wallets
      SET 
        balance = balance - NEW.amount,
        ride_coins = ride_coins + NEW.ride_coins_change, -- can be negative for redemption
        carbon_credits = carbon_credits + NEW.carbon_credits_change,
        total_spent = total_spent + NEW.amount,
        updated_at = now()
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_completed
  AFTER UPDATE ON wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE payment_methods
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_payment_method
  BEFORE INSERT OR UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_payment();