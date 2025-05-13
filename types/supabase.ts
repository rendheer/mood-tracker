import { PostgrestError, PostgrestResponse } from '@supabase/supabase-js'

export interface MoodEntry {
  id: string
  user_id: string
  mood: string
  note: string | null
  created_at: string
}

export interface StreakData {
  user_id: string
  current_streak: number
  longest_streak: number
  last_updated: string
}

export interface MoodEntryWithTimestamp {
  id: string
  user_id: string
  mood: string
  note: string | null
  timestamp: Date
  created_at: string
}

export interface MoodAnalyticsEntry {
  mood: string
  timestamp: Date
  note?: string
  id?: string
}
