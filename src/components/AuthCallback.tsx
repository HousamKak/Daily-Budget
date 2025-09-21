import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { dialogStyles } from '@/styles'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          setStatus('error')
          setMessage('Authentication service unavailable')
          return
        }

        // Get the access_token and refresh_token from URL params
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type')

        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session with the tokens from email verification
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('Auth callback error:', error)
            setStatus('error')
            setMessage('Failed to verify email. Please try signing in again.')
          } else if (data.user) {
            setStatus('success')
            setMessage('Email verified successfully! Redirecting to your budget...')

            // Redirect to home page after a brief delay
            setTimeout(() => {
              navigate('/', { replace: true })
            }, 2000)
          } else {
            setStatus('error')
            setMessage('Verification completed but user session not found. Please sign in again.')
          }
        } else {
          // Handle other auth callback types or missing params
          setStatus('error')
          setMessage('Invalid verification link. Please request a new verification email.')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred during verification.')
      }
    }

    handleAuthCallback()
  }, [searchParams, navigate])

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying Your Email...'
      case 'success':
        return 'Email Verified!'
      case 'error':
        return 'Verification Failed'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className={dialogStyles.paperDialog}>
          {/* Paper texture overlay */}
          <div className={dialogStyles.paperTexture}></div>

          {/* Yellow transparent tape */}
          <div className={dialogStyles.yellowTape}></div>

          {/* Torn edge effect */}
          <div className={dialogStyles.tornEdge}></div>

          <div className={dialogStyles.contentWrapper}>
            <div className="text-center space-y-6">
              {/* Status icon */}
              <div className="flex justify-center">
                {getIcon()}
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-800">
                  {getTitle()}
                </h2>
                <p className="text-stone-600">
                  {message}
                </p>
              </div>

              {status === 'error' && (
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-800">
                      If you continue to have issues, please try requesting a new verification email from the sign-in page.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/', { replace: true })}
                    className="w-full px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                  >
                    Return to App
                  </button>
                </div>
              )}

              {status === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-800">
                    🎉 Welcome to Daily Budget! You'll be redirected automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}