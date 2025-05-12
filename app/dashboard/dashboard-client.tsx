"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import MoodSelector from "@/components/mood-selector"
import MoodSuggestions from "@/components/mood-suggestions"
import MoodHistory from "@/components/mood-history"
import MoodAnalytics from "@/components/mood-analytics"
import MoodCorrelation from "@/components/mood-correlation"
import UserProfile from "@/components/auth/user-profile"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardClientProps {
  user: User
  initialMoodEntries: any[]
  streakData: {
    current_streak: number
    longest_streak: number
  }
}

export default function DashboardClient({ user, initialMoodEntries, streakData }: DashboardClientProps) {
  const router = useRouter()
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [moodHistory, setMoodHistory] = useState<Array<{ mood: string; timestamp: Date; note?: string; id?: string }>>(
    () =>
      initialMoodEntries.map((entry) => ({
        id: entry.id,
        mood: entry.mood,
        note: entry.note,
        timestamp: new Date(entry.created_at),
      })),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBetaMode, setIsBetaMode] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setIsBetaMode(localStorage.getItem('beta-test-mode') === 'true')
  }, [])

  const handleMoodSelection = async (mood: string, note?: string) => {
    if (isSubmitting) return

    // If no note is provided and we're just updating the UI selection
    if (note === undefined) {
      setSelectedMood(mood)
      return
    }

    setIsSubmitting(true)

    try {
      // Save mood to database with note
      const { data, error } = await supabase
        .from("mood_entries")
        .insert([
          {
            user_id: user.id,
            mood: mood,
            note: note || null,
          },
        ])
        .select()

      if (error) {
        console.error("Error saving mood:", error)
        toast({
          title: "Error saving mood",
          description: "Please try again later",
          variant: "destructive",
        })
        return
      }

      // Update local state with the new entry
      const newEntry = {
        id: data[0].id,
        mood: mood,
        note: note || undefined,
        timestamp: new Date(),
      }

      setMoodHistory((prev) => [newEntry, ...prev])

      // Show success message
      toast({
        title: "Mood saved",
        description: note ? "Your mood and note have been saved" : "Your mood has been saved",
      })

      // Refresh the page to get updated streak data
      router.refresh()
    } catch (error) {
      console.error("Error in mood selection:", error)
      toast({
        title: "Error saving mood",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditNote = async (id: string, note: string) => {
    try {
      const { error } = await supabase
        .from("mood_entries")
        .update({ note: note || null })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating note:", error)
        toast({
          title: "Error updating note",
          description: "Please try again later",
          variant: "destructive",
        })
        return
      }

      // Update local state
      setMoodHistory((prev) => prev.map((entry) => (entry.id === id ? { ...entry, note: note || undefined } : entry)))

      toast({
        title: "Note updated",
        description: "Your mood note has been updated",
      })
    } catch (error) {
      console.error("Error updating note:", error)
      toast({
        title: "Error updating note",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your mood history? This cannot be undone.")) {
      return
    }

    try {
      // Delete all mood entries for this user
      const { error } = await supabase.from("mood_entries").delete().eq("user_id", user.id)

      if (error) {
        console.error("Error clearing history:", error)
        toast({
          title: "Error clearing history",
          description: "Please try again later",
          variant: "destructive",
        })
        return
      }

      // Clear local state
      setMoodHistory([])
      setSelectedMood(null)

      toast({
        title: "History cleared",
        description: "Your mood history has been cleared",
      })

      // Refresh the page to get updated streak data
      router.refresh()
    } catch (error) {
      console.error("Error clearing history:", error)
      toast({
        title: "Error clearing history",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  // Convert database streak data to the format expected by MoodStreak component
  const formattedHistory = moodHistory.map((entry) => ({
    mood: entry.mood,
    timestamp: entry.timestamp,
  }))

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700">Journal My Mind</h1>
          <UserProfile />
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-700">How are you feeling today?</CardTitle>
            <CardDescription>
              Track your mood and get personalized suggestions to improve your wellbeing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MoodSelector onSelectMood={handleMoodSelection} selectedMood={selectedMood} isDisabled={isSubmitting} />
          </CardContent>
        </Card>

        {streakData && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-blue-700">Your Streak</CardTitle>
            </CardHeader>
            <CardContent>
              {isBetaMode && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative mb-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      You are in Beta Test Mode. All your data will be temporary and will be cleared when you leave this session.
                    </span>
                  </div>
                </div>
              )}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <span className="text-3xl">🔥</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Streak</p>
                    <p className="text-2xl font-bold">{streakData.current_streak} days</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Longest Streak</p>
                    <p className="text-2xl font-bold">{streakData.longest_streak} days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMood && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-blue-700">
                {selectedMood === "🥰" ? "Great job! Keep it up!" : "Suggestions to Improve Your Mood"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MoodSuggestions mood={selectedMood} />
            </CardContent>
          </Card>
        )}

        {moodHistory.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-blue-700">Your Mood Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="history">
                <TabsList className="mb-4">
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="patterns">Patterns</TabsTrigger>
                </TabsList>
                <TabsContent value="history">
                  <MoodHistory history={moodHistory} onEditNote={handleEditNote} />
                </TabsContent>
                <TabsContent value="analytics">
                  <MoodAnalytics history={formattedHistory} />
                </TabsContent>
                <TabsContent value="patterns">
                  <MoodCorrelation history={moodHistory} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {moodHistory.length > 0 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleClearHistory}
              className="text-blue-700 border-blue-700 hover:bg-blue-100"
            >
              Clear History
            </Button>
          </div>
        )}
      </div>
      <Toaster />
    </main>
  )
}
