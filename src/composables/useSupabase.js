import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function useSupabase() {
  return {
    supabase,
    auth: supabase.auth,
    from: supabase.from.bind(supabase),
    storage: supabase.storage,
    functions: supabase.functions,
    realtime: supabase.realtime
  }
}