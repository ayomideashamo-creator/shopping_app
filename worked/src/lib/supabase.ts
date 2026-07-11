import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function initializeSupabase() {
  try {
    // Test connection
    const { data, error } = await supabase.from('shop_items').select('count()').limit(1);
    if (error) throw error;
    console.log('Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return false;
  }
}
