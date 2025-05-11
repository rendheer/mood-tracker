import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = createClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch user's mood entries
  const { data: moodEntries } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  // Fetch user's streak information
  const { data: streakData } = await supabase.from("user_streaks").select("*").eq("user_id", session.user.id).single()

  return (
    <DashboardClient
      user={session.user}
      initialMoodEntries={moodEntries || []}
      streakData={streakData || { current_streak: 0, longest_streak: 0 }}
    />
  )
}
