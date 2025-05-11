import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

// Create a Supabase client for use in server components
export const createClient = () => {
  return createServerComponentClient<Database>({ cookies })
}
