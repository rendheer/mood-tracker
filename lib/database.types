export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mood_entries: {
        Row: {
          id: string
          user_id: string
          mood: string
          note: string | null
          created_at: string
          entry_date: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: string
          note?: string | null
          created_at?: string
          entry_date?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: string
          note?: string | null
          created_at?: string
          entry_date?: string
        }
      }
      user_streaks: {
        Row: {
          user_id: string
          current_streak: number
          longest_streak: number
          last_entry_date: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_entry_date?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_entry_date?: string | null
          updated_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_type: string
          achieved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_type: string
          achieved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_type?: string
          achieved_at?: string
        }
      }
    }
  }
}
