"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { MoodEntry, StreakData } from '@/types/supabase'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserProfile from "@/components/auth/user-profile"
import MoodHistory from "@/components/mood/mood-history"
import MoodAnalytics from "@/components/mood/mood-analytics"
import MoodCorrelation from "@/components/mood/mood-correlation"

interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

interface MoodEntryWithTimestamp extends MoodEntry {
  timestamp: Date;
}

interface DashboardClientProps {
  user: User | null;
  initialMoodEntries?: MoodEntryWithTimestamp[];
  initialStreakData?: StreakData | null;
  isBetaMode?: boolean;
}

interface MoodSelectorProps {
  onSelectMood: (mood: string, note?: string) => void
  selectedMood: string | null
  isDisabled?: boolean
}

interface MoodHistoryProps {
  history: MoodEntry[]
  onEditNote?: (id: string, note: string) => Promise<void>
  onClearHistory?: () => Promise<void>
}

interface MoodAnalyticsProps {
  history: MoodEntry[]
}

interface MoodCorrelationProps {
  history: MoodEntry[]
}

// Define mood values for analytics
const moodValues: Record<string, number> = {
  "🥰": 5, // Very Happy
  "😄": 4, // Happy
  "😊": 3, // Content
  "😐": 2, // Neutral
  "😔": 1, // Sad
  "😢": 0  // Very Sad
}

// Define mood suggestions
const moodSuggestions: Record<string, { title: string; description: string }[]> = {
  "😊": [
    { title: "Celebrate", description: "Share what made you happy today" },
    { title: "Gratitude", description: "Write down three things you're grateful for" },
    { title: "Reflect", description: "Think about what made you feel good" }
  ],
  "😐": [
    { title: "Plan", description: "Make a plan for tomorrow" },
    { title: "Journal", description: "Write about your day" },
    { title: "Relax", description: "Take a break and do something you enjoy" }
  ],
  "😔": [
    { title: "Take a Break", description: "Take a short break and do something you enjoy" },
    { title: "Connect with Someone", description: "Call a friend or family member to chat" },
    { title: "Write it Down", description: "Express your feelings in writing" }
  ]
}

interface DashboardState {
  selectedMood: string | null;
  note: string | null;
  isSubmitting: boolean;
  moodHistory: MoodEntryWithTimestamp[];
  streakData: StreakData | null;
  isBetaMode: boolean;
}

export default function DashboardClient({ user, initialMoodEntries, initialStreakData, isBetaMode: initialBetaMode = false }: DashboardClientProps) {
  // Hooks
  const router = useRouter();
  const { data: session } = useSession();
  const supabase = createClientComponentClient();
  
  // Initialize state
  const [state, setState] = useState<DashboardState>(() => ({
    selectedMood: null,
    note: null,
    isSubmitting: false,
    moodHistory: initialMoodEntries || [],
    streakData: initialStreakData || null,
    isBetaMode: initialBetaMode
  }));
  
  // Destructure state for easier access
  const { selectedMood, note, isSubmitting, moodHistory, streakData, isBetaMode } = state;
  
  // Handle mood selection
  const handleMoodSelect = (mood: string) => {
    setState(prev => ({ ...prev, selectedMood: mood }));
  };

  // Handle note change
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, note: e.target.value }));
  };

  useEffect(() => {
    const loadMoodHistory = async () => {
      if (!isBetaMode && !user?.id) return;

      try {
        const userId = isBetaMode ? 'beta-test-user' : user?.id;
        if (!userId) return;
        
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedData = data.map(entry => ({
            ...entry,
            timestamp: new Date(entry.created_at)
          }));
          setState(prev => ({ ...prev, moodHistory: formattedData }));
        }
      } catch (error) {
        console.error('Error loading mood history:', error);
      }
    };

    loadMoodHistory();
  }, [isBetaMode, user?.id, supabase]);

  useEffect(() => {
    const calculateStreak = async () => {
      try {
        if (!user?.id && !isBetaMode) return;
        
        const userId = isBetaMode ? 'beta-test-user' : user?.id;
        if (!userId) return;
        
        const { data, error: fetchError } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        if (data) {
          setState(prev => ({ ...prev, streakData: data }));
        } else {
          // Create initial streak if it doesn't exist
          const newStreak = {
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            last_updated: new Date().toISOString()
          }

          const { error: insertError } = await supabase
            .from('streaks')
            .insert([newStreak])
          
          if (!insertError) {
            setState(prev => ({ ...prev, streakData: newStreak }));
          } else {
            throw insertError;
          }
        }
      } catch (error) {
        console.error('Error fetching streak data:', error);
        toast.error('Failed to load streak data');
      }
    }

    calculateStreak()
  }, [user, supabase])

  // Handle saving mood
  const handleSaveMood = async () => {
    if (!selectedMood || isSubmitting) return;

    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const userId = isBetaMode ? 'beta-test-user' : user?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const { data: newEntry, error } = await supabase
        .from('mood_entries')
        .insert([
          {
            user_id: userId,
            mood: selectedMood,
            note: note,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      if (newEntry) {
        const entryWithTimestamp: MoodEntryWithTimestamp = {
          ...newEntry,
          timestamp: new Date(newEntry.created_at)
        };
        
        // Update local state
        setState(prev => ({
          ...prev,
          moodHistory: [entryWithTimestamp, ...prev.moodHistory],
          selectedMood: null,
          note: null
        }));
        
        // Update streak data
        const today = new Date().toDateString();
        const lastEntry = moodHistory[0];
        const lastEntryDate = lastEntry ? new Date(lastEntry.created_at).toDateString() : null;
        
        if (!lastEntry || lastEntryDate !== today) {
          const currentStreak = streakData?.current_streak || 0;
          const newStreakData = {
            user_id: userId,
            current_streak: currentStreak + 1,
            longest_streak: Math.max(
              streakData?.longest_streak || 0,
              currentStreak + 1
            ),
            last_updated: new Date().toISOString()
          };
          
          // Update streak in the database
          const { error: streakError } = await supabase
            .from('streaks')
            .upsert([newStreakData])
            .eq('user_id', userId);
            
          if (streakError) throw streakError;
          
          // Update local state with new streak data
          setState(prev => ({
            ...prev,
            streakData: newStreakData
          }));
        }
      }
      
      toast.success('Mood saved successfully!');
    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error('Failed to save mood. Please try again.');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your mood history? This action cannot be undone.')) {
      return;
    }

    try {
      const userId = isBetaMode ? 'beta-test-user' : user?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        moodHistory: [],
        selectedMood: null,
        note: null,
        isSubmitting: false
      }));
      
      toast.success('History cleared successfully!');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history. Please try again.');
    }
  };

  // Format mood history for display
  const formattedHistory = moodHistory.map(entry => ({
    ...entry,
    timestamp: new Date(entry.timestamp)
  }));

  // Handle note editing
  const handleEditNote = async (id: string, newNote: string) => {
    try {
      const { error } = await supabase
        .from('mood_entries')
        .update({ note: newNote })
        .eq('id', id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        moodHistory: prev.moodHistory.map(entry => 
          entry.id === id ? { ...entry, note: newNote } : entry
        )
      }));

      toast.success('Note updated successfully!');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note. Please try again.');
    }
  };

  // Get mood suggestions based on selected mood
  const getMoodSuggestions = (mood: string | null) => {
    if (!mood) return [];
    
    // Default suggestions for neutral mood
    if (!moodSuggestions[mood]) {
      return [
        { title: "Reflect", description: "Take a moment to reflect on your day" },
        { title: "Journal", description: "Write down your thoughts and feelings" },
        { title: "Breathe", description: "Take a few deep breaths to center yourself" }
      ];
    }
    
    return moodSuggestions[mood];
  };

  // Helper functions for mood calculations
  const calculateAverageMood = (history: Array<{ mood: string; timestamp: Date }>): string => {
    if (history.length === 0) return "N/A";
    const total = history.reduce((sum, entry) => sum + (moodValues[entry.mood] || 0), 0);
    const average = total / history.length;
    const closestMood = Object.entries(moodValues).reduce((acc, [mood, value]) => {
      return Math.abs(value - average) < Math.abs(acc[1] - average) ? [mood, value] : acc;
    }, ["", 0] as [string, number])[0];
    return closestMood;
  }

  const calculateMostCommonMood = (history: Array<{ mood: string; timestamp: Date }>): string => {
    if (history.length === 0) return "N/A";
    const counts = history.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).reduce((acc, [mood, count]) => {
      return count > acc[1] ? [mood, count] : acc;
    }, ["", 0] as [string, number])[0];
  }

  const calculateMoodVariability = (history: Array<{ mood: string; timestamp: Date }>): string => {
    if (history.length === 0) return "0";
    const values = history.map(entry => moodValues[entry.mood] || 0);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / values.length;
    return ((Math.sqrt(variance) / 4) * 100).toFixed(1); // Normalize to 0-100%
  }

  const calculateBestDay = (history: Array<{ mood: string; timestamp: Date }>) => {
    if (history.length === 0) return "N/A"
    const dayAverages = Array(7).fill(0)
    const dayCounts = Array(7).fill(0)
    
    history.forEach(entry => {
      const dayIndex = entry.timestamp.getDay()
      dayAverages[dayIndex] += moodValues[entry.mood]
      dayCounts[dayIndex]++
    })

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    let bestDayIndex = 0
    let highestAverage = 0

    dayAverages.forEach((total, index) => {
      if (dayCounts[index] > 0) {
        const average = total / dayCounts[index]
        if (average > highestAverage) {
          highestAverage = average
          bestDayIndex = index
        }
      }
    })

    return dayNames[bestDayIndex]
  }

  const calculateWorstDay = (history: Array<{ mood: string; timestamp: Date }>) => {
    if (history.length === 0) return "N/A"
    const dayAverages = Array(7).fill(0)
    const dayCounts = Array(7).fill(0)
    
    history.forEach(entry => {
      const dayIndex = entry.timestamp.getDay()
      dayAverages[dayIndex] += moodValues[entry.mood]
      dayCounts[dayIndex]++
    })

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    let worstDayIndex = 0
    let lowestAverage = 5 // Start with highest possible value

    dayAverages.forEach((total, index) => {
      if (dayCounts[index] > 0) {
        const average = total / dayCounts[index]
        if (average < lowestAverage) {
          lowestAverage = average
          worstDayIndex = index
        }
      }
    })

    return dayNames[worstDayIndex]
  }

  const calculateMostActiveDay = (history: Array<{ mood: string; timestamp: Date }>) => {
    if (history.length === 0) return "N/A"
    const dayCounts = Array(7).fill(0)
    
    history.forEach(entry => {
      dayCounts[entry.timestamp.getDay()]++
    })

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return dayNames[dayCounts.indexOf(Math.max(...dayCounts))]
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700">Journal My Mind</h1>
          <UserProfile />
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-blue-700">Track Your Mood</CardTitle>
            <CardDescription className="text-gray-600">
              Share how you're feeling today and get personalized suggestions to improve your wellbeing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(moodValues).map(([mood, value]) => (
                    <button
                      key={mood}
                      onClick={() => handleMoodSelect(mood)}
                      className={`
                        flex flex-col items-center p-4 rounded-lg transition-all duration-200
                        ${selectedMood === mood 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <span className="text-3xl mb-2">{mood}</span>
                      <span className="text-sm font-medium">
                        {value === 5 ? "Very Happy" : 
                         value === 4 ? "Happy" :
                         value === 3 ? "Neutral" :
                         value === 2 ? "Sad" :
                         "Very Sad"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedMood && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="note" className="text-lg font-medium text-gray-900">
                      Add a note (optional)
                    </Label>
                    <Textarea
                      id="note"
                      placeholder={`What's on your mind about feeling ${selectedMood} today?`}
                      value={note || ''}
                      onChange={handleNoteChange}
                      className="min-h-[100px] w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {selectedMood !== "🥰" && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-700 mb-4">
                        Personalized Mood Improvement Suggestions
                      </h3>
                      <ul className="space-y-2">
                        {getMoodSuggestions(selectedMood).map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="text-blue-500">•</span>
                            <div>
                              <p className="font-medium text-gray-800 mb-1">{suggestion.title}</p>
                              <p className="text-gray-600">{suggestion.description}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleSaveMood}
              disabled={isSubmitting || !selectedMood}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Mood"
              )}
            </Button>
          </CardFooter>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                  <div className="bg-blue-100 p-3 rounded-full mb-2">
                    <span className="text-3xl">🔥</span>
                  </div>
                  <p className="text-sm text-gray-500">Current Streak</p>
                  <p className="text-3xl font-bold text-blue-700">{streakData.current_streak} days</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {streakData.current_streak === 0 ? "Start your streak today!" : streakData.current_streak === 1 ? "Great start!" : streakData.current_streak < 7 ? "Keep it going!" : streakData.current_streak < 30 ? "Impressive streak!" : "Amazing consistency!"}
                  </p>
                </div>
                <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                  <div className="bg-purple-100 p-3 rounded-full mb-2">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <p className="text-sm text-gray-500">Longest Streak</p>
                  <p className="text-3xl font-bold text-purple-700">{streakData.longest_streak} days</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {streakData.longest_streak === 0 ? "No streak yet" : streakData.longest_streak === 1 ? "Good start" : streakData.longest_streak < 7 ? "Solid start" : streakData.longest_streak < 30 ? "Great consistency" : "Incredible streak!"}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Streak Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(streakData.current_streak / streakData.longest_streak) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Mood Insights</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                    <div className="bg-blue-100 p-3 rounded-full mb-2">
                      <span className="text-3xl">📊</span>
                    </div>
                    <p className="text-sm text-gray-500">Average Mood</p>
                    <p className="text-3xl font-bold text-blue-700">{calculateAverageMood(formattedHistory)}</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                    <div className="bg-purple-100 p-3 rounded-full mb-2">
                      <span className="text-3xl">📈</span>
                    </div>
                    <p className="text-sm text-gray-500">Most Common Mood</p>
                    <p className="text-3xl font-bold text-purple-700">{calculateMostCommonMood(formattedHistory)}</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                    <div className="bg-blue-100 p-3 rounded-full mb-2">
                      <span className="text-3xl">📊</span>
                    </div>
                    <p className="text-sm text-gray-500">Mood Variability</p>
                    <p className="text-3xl font-bold text-blue-700">{calculateMoodVariability(formattedHistory)}%</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                    <div className="bg-purple-100 p-3 rounded-full mb-2">
                      <span className="text-3xl">📆</span>
                    </div>
                    <p className="text-sm text-gray-500">Best Day</p>
                    <p className="text-3xl font-bold text-purple-700">{calculateBestDay(formattedHistory)}</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                    <div className="bg-blue-100 p-3 rounded-full mb-2">
                      <span className="text-3xl">📆</span>
                    </div>
                    <p className="text-sm text-gray-500">Worst Day</p>
                    <p className="text-3xl font-bold text-blue-700">{calculateWorstDay(formattedHistory)}</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                    <div className="bg-purple-100 p-3 rounded-full mb-2">
                      <span className="text-3xl">📆</span>
                    </div>
                    <p className="text-sm text-gray-500">Most Active Day</p>
                    <p className="text-3xl font-bold text-purple-700">{calculateMostActiveDay(formattedHistory)}</p>
                  </div>
                </div>
              </div>
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
      </div>
    </main>
  )
}
