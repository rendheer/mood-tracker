import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Create a Supabase client for use in server components
export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createSupabaseClient(url, anonKey)
}
