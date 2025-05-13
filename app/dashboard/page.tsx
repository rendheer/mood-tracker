import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  // Create Supabase client with proper configuration
  const supabase = createClient()
  
  // For beta test mode, we'll create a temporary user object
  const tempUser = {
    id: 'beta-test-user',
    email: 'beta-test@journalmymind.com',
    user_metadata: {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated'
  }

  // Initialize streak data if it doesn't exist
  let streakData = null
  try {
    const { data: existingStreak } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", tempUser.id)
      .single()
    
    streakData = existingStreak
  } catch (error) {
    // If streak doesn't exist, create it
    const { error: insertError } = await supabase
      .from("user_streaks")
      .insert([
        {
          user_id: tempUser.id,
          current_streak: 0,
          longest_streak: 0,
          last_mood_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error("Error creating streak data:", insertError)
      streakData = { current_streak: 0, longest_streak: 0 }
    } else {
      streakData = { current_streak: 0, longest_streak: 0 }
    }
  }

  // Fetch mood entries for beta test mode
  const { data: moodEntries } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", tempUser.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardClient
      user={tempUser}
      initialMoodEntries={moodEntries || []}
      streakData={streakData || { current_streak: 0, longest_streak: 0 }}
    />
  )
}
