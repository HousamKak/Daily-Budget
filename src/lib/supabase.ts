import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Using localStorage fallback.')
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export interface Database {
  public: {
    Tables: {
      budgets: {
        Row: {
          id: string
          user_id: string
          month_key: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month_key: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month_key?: string
          amount?: number
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          month_key: string
          date: string
          amount: number
          category?: string
          note?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month_key: string
          date: string
          amount: number
          category?: string
          note?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month_key?: string
          date?: string
          amount?: number
          category?: string
          note?: string
          created_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          user_id: string
          month_key: string
          week_index: number
          amount: number
          category?: string
          note?: string
          target_date?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month_key: string
          week_index: number
          amount: number
          category?: string
          note?: string
          target_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month_key?: string
          week_index?: number
          amount?: number
          category?: string
          note?: string
          target_date?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}