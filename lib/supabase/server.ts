import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Create a Supabase client for use in server components
export const createClient = () => {
  return createSupabaseClient({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  })
}
