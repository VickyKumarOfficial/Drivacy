import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Debug: Log environment variables to ensure they are loaded correctly
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helper functions
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Profile helper functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Wallet helper functions
export const getUserWallet = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_wallets')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

export const getWalletTransactions = async (userId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

// Rides helper functions
export const getUserRides = async (userId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('rides')
    .select(`
      *,
      drivers:driver_id (
        user_profiles (full_name)
      ),
      vehicles:vehicle_id (
        make,
        model,
        vehicle_type,
        is_electric
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const createRide = async (rideData: any) => {
  const { data, error } = await supabase
    .from('rides')
    .insert(rideData)
    .select()
    .single();
  return { data, error };
};

// Offers helper functions
export const getActiveOffers = async () => {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('is_active', true)
    .gte('valid_until', new Date().toISOString())
    .order('created_at', { ascending: false });
  return { data, error };
};

export const validateOffer = async (userId: string, offerId: string, rideAmount: number) => {
  const { data, error } = await supabase.rpc('validate_offer_usage', {
    p_user_id: userId,
    p_offer_id: offerId,
    p_ride_amount: rideAmount,
  });
  return { data, error };
};