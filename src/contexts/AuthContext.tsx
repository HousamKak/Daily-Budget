import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } else {
      // No Supabase available, set loading to false
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    setLoading(true)
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    return result
  }

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    setLoading(true)
    const result = await supabase.auth.signUp({
      email,
      password,
    })
    setLoading(false)
    return result
  }

  const signOut = async () => {
    if (!supabase) return

    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    return await supabase.auth.resetPasswordForEmail(email)
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}