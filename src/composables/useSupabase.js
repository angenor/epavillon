import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.')
  console.error('Copy .env.local.example to .env.local and add your Supabase credentials.')
  
  // Créer un mock Supabase pour éviter les erreurs
  supabase = {
    auth: {
      signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
      signUp: () => Promise.reject(new Error('Supabase not configured')),
      signInWithOAuth: () => Promise.reject(new Error('Supabase not configured')),
      signOut: () => Promise.reject(new Error('Supabase not configured')),
      getSession: () => Promise.resolve({ data: { session: null } }),
      resetPasswordForEmail: () => Promise.reject(new Error('Supabase not configured')),
      resend: () => Promise.reject(new Error('Supabase not configured')),
      user: { value: null }
    },
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [] }),
        eq: () => ({
          limit: () => Promise.resolve({ data: [] })
        }),
        ilike: () => ({
          eq: () => ({
            limit: () => Promise.resolve({ data: [] })
          })
        })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null })
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({ data: null })
      }),
      delete: () => Promise.reject(new Error('Supabase not configured'))
    }),
    storage: {},
    functions: {},
    realtime: {}
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

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