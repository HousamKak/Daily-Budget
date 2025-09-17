import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const appEnv = import.meta.env.VITE_APP_ENV || 'development'

// Detailed logging for debugging
console.log('🔍 Environment Debug Info:')
console.log(`📝 VITE_APP_ENV: "${appEnv}"`)
console.log(`🌐 VITE_SUPABASE_URL exists: ${!!supabaseUrl}`)
console.log(`🔑 VITE_SUPABASE_PUBLISHABLE_KEY exists: ${!!supabaseKey}`)
if (supabaseUrl) {
  console.log(`📡 Supabase URL: ${supabaseUrl}`)
}
if (supabaseKey) {
  console.log(`🔐 Supabase Key (first 10 chars): ${supabaseKey.substring(0, 10)}...`)
}

// Additional debug logging
console.log('🔧 Additional Build-time Debug Info:')
console.log(`🌍 NODE_ENV: ${typeof process !== 'undefined' ? process.env.NODE_ENV : 'undefined'}`)
console.log(`⚙️ import.meta.env.MODE: ${import.meta.env.MODE}`)
console.log(`🏗️ import.meta.env.PROD: ${import.meta.env.PROD}`)
console.log(`🏃 import.meta.env.DEV: ${import.meta.env.DEV}`)

// Log all environment variables that start with VITE_
console.log('📋 All VITE_ environment variables:')
Object.keys(import.meta.env).forEach(key => {
  if (key.startsWith('VITE_')) {
    const value = import.meta.env[key]
    if (key.includes('KEY') || key.includes('SECRET')) {
      console.log(`   ${key}: ${value ? `[${value.length} chars] ${value.substring(0, 10)}...` : 'undefined'}`)
    } else {
      console.log(`   ${key}: ${value}`)
    }
  }
})

// Check if Supabase credentials are available
const hasSupabaseCredentials = supabaseUrl && supabaseKey

// Enhanced credential status logging
if (hasSupabaseCredentials) {
  console.log('✅ Supabase credentials are available')
  console.log(`   📊 URL length: ${supabaseUrl.length} chars`)
  console.log(`   📊 Key length: ${supabaseKey.length} chars`)
} else {
  console.warn('❌ Supabase credentials are missing')
  console.warn(`   - URL missing: ${!supabaseUrl} (value: ${supabaseUrl})`)
  console.warn(`   - Key missing: ${!supabaseKey} (value: ${supabaseKey})`)
  
  // Check if we're in production and missing credentials
  if (appEnv === 'production') {
    console.error('🚨 CRITICAL: Production build is missing Supabase credentials!')
    console.error('   This suggests GitHub secrets are not properly configured.')
  }
}

// Only validate environment variables if we expect them to be present
if (appEnv === 'development' && !hasSupabaseCredentials) {
  console.warn('⚠️ Supabase credentials not found. App will use localStorage fallback.')
}

// Validate environment value
if (appEnv && !['development', 'production'].includes(appEnv)) {
  throw new Error(`Invalid VITE_APP_ENV: ${appEnv}. Must be 'development' or 'production'`)
}

// Create Supabase client only if credentials are available
export const supabase = hasSupabaseCredentials 
  ? createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: 'public'
      },
      auth: {
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// Export environment info for debugging
export const isDev = appEnv === 'development'
export const isProd = appEnv === 'production'

if (hasSupabaseCredentials) {
  console.log(`🚀 App running in ${appEnv} mode with Supabase`)
  console.log(`📡 Supabase URL: ${supabaseUrl}`)
} else {
  console.log(`🚀 App running in ${appEnv} mode with localStorage fallback`)
  console.log(`💾 Supabase not configured - using local storage only`)
}

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