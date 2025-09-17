import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { signIn, signUp, resetPassword } = useAuth()

  // Theme-matching icons
  const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

  const LockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          return
        }

        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Check your email for a confirmation link!')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          onOpenChange(false)
          resetForm()
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const { error } = await resetPassword(email)
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for a password reset link!')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setMessage('')
    setIsSignUp(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-xl">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-2xl font-bold text-stone-700 flex items-center justify-center gap-2">
            <UserIcon />
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <p className="text-sm text-stone-600 mt-1">
            {isSignUp ? 'Join to sync your budget across devices' : 'Sign in to access your budget'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-stone-700 font-medium">Email</Label>
            <div className="relative">
              <UserIcon />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-200 rounded-xl"
                placeholder="your.email@example.com"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <UserIcon />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-stone-700 font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-200 rounded-xl"
                placeholder="Enter your password"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <LockIcon />
              </div>
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-stone-700 font-medium">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-200 rounded-xl"
                  placeholder="Confirm your password"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <LockIcon />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
              {message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-amber-200 hover:bg-amber-300 text-stone-800 font-semibold rounded-xl border-2 border-amber-300 shadow-lg hover:shadow-xl transition-all"
            disabled={isLoading}
          >
            {isLoading ? '🔄 Loading...' : (isSignUp ? '🚀 Create Account' : '🔓 Sign In')}
          </Button>
        </form>

        <div className="space-y-2 pt-2 border-t border-amber-200">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-stone-600 hover:text-stone-800 hover:bg-amber-100"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
          >
            {isSignUp ? '← Already have an account? Sign In' : "Don't have an account? Sign Up →"}
          </Button>

          {!isSignUp && (
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm text-stone-500 hover:text-stone-700 hover:bg-amber-50"
              onClick={handleResetPassword}
              disabled={isLoading || !email}
            >
              🔑 Forgot Password?
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AuthButton() {
  const { user, signOut, loading } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  if (loading) {
    return (
      <Button
        disabled
        className="rounded-2xl bg-amber-100 text-stone-600 border border-amber-200"
      >
        🔄 Loading...
      </Button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 bg-white/80 rounded-2xl px-3 py-2 shadow-sm border border-amber-200">
        <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-stone-700">
            {user.email?.[0]?.toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-stone-700 hidden sm:inline max-w-24 truncate">
          {user.email}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-stone-600 hover:text-stone-800 hover:bg-amber-100 rounded-xl"
        >
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={() => setShowAuthDialog(true)}
        className="rounded-2xl shadow hover:shadow-md transition-all bg-amber-200/80 text-stone-900 border border-amber-300 hover:bg-amber-300/80"
      >
        🔐 Sign In
      </Button>
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </>
  )
}