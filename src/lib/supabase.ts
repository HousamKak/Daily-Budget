import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const appEnv = import.meta.env.VITE_APP_ENV || 'development'

// Validate required environment variables
const requiredEnvVars = {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_PUBLISHABLE_KEY: supabaseKey,
  VITE_APP_ENV: appEnv
}

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

// Validate environment value
if (!['development', 'production'].includes(appEnv)) {
  throw new Error(`Invalid VITE_APP_ENV: ${appEnv}. Must be 'development' or 'production'`)
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Export environment info for debugging
export const isDev = appEnv === 'development'
export const isProd = appEnv === 'production'

console.log(`🚀 App running in ${appEnv} mode`)
console.log(`📡 Supabase URL: ${supabaseUrl}`)

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