import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Create a single instance of the Supabase client for use in client components
export const createClient = () => {
  return createClientComponentClient<Database>()
}
