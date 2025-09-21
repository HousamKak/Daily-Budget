import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { paperTheme, paperStyles } from '@/styles'

type ConfirmationStatus = 'verifying' | 'success' | 'error'

const messages = {
  verifying: 'We are verifying your email address. This should only take a moment... ✨',
  success: 'Your email has been verified! You are now signed in and ready to start budgeting. 🎉',
  error: 'We could not verify your email. Please try the link again or request a new confirmation email.',
} as const

export function EmailConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [status, setStatus] = useState<ConfirmationStatus>('verifying')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const hasAuthParams = useMemo(() => {
    const hashParams = new URLSearchParams(location.hash.replace('#', ''))
    const searchParams = new URLSearchParams(location.search)
    return hashParams.size > 0 || searchParams.size > 0
  }, [location.hash, location.search])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined

    const verifyEmail = async () => {
      if (!supabase) {
        setErrorMessage('Supabase client is not available.')
        setStatus('error')
        return
      }

      try {
        if (hasAuthParams) {
          const { error } = await supabase.auth.getSession()
          if (error) {
            throw error
          }

          // Remove the auth params from the URL once we have handled them
          window.history.replaceState({}, document.title, location.pathname)
        }

        setStatus('success')
        timeout = setTimeout(() => {
          navigate('/', { replace: true })
        }, 2000)
      } catch (err) {
        console.error('Email verification error:', err)
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error occurred during verification.')
        setStatus('error')
      }
    }

    verifyEmail()

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [hasAuthParams, location.pathname, navigate])

  const handleReturnHome = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${paperTheme.colors.background.whiteTransparent}`}>
      <div className="relative w-full max-w-xl">
        <div className={`${paperTheme.colors.background.cardGradient} ${paperTheme.colors.borders.paper} ${paperTheme.radius.lg} p-8 shadow-xl overflow-hidden`}>
          <div className={`${paperTheme.effects.paperTexture} absolute inset-0 opacity-15 pointer-events-none ${paperTheme.radius.lg}`}></div>
          <div className={`${paperTheme.effects.tornEdge} absolute -top-1 left-6 right-6 h-3`}></div>

          <div className="relative z-10 space-y-6 text-center">
            <h1 className={`text-3xl font-bold ${paperTheme.colors.text.accent} ${paperTheme.fonts.handwriting}`}>
              Email Confirmation
            </h1>

            <div className="space-y-3">
              <p className={`text-base sm:text-lg ${paperTheme.colors.text.secondary}`}>{messages[status]}</p>
              {status === 'error' && errorMessage && (
                <p className={`text-sm ${paperTheme.colors.text.muted}`}>Details: {errorMessage}</p>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleReturnHome}
                className={`${paperStyles.primaryButton} px-6 py-2 text-base`}
              >
                Return to app
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailConfirmation