import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { dialogStyles, cn } from '@/styles'

export function EmailVerificationWaiting({ email, onBackToSignIn }: {
  email: string
  onBackToSignIn: () => void
}) {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const { signUp } = useAuth()

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendMessage('')

    try {
      // We need to trigger signup again to resend the email
      // In a real app, you'd have a separate resend endpoint
      const { error } = await signUp(email, '')
      if (error && !error.message.includes('already registered')) {
        setResendMessage('❌ Failed to resend email. Please try again.')
      } else {
        setResendMessage('📧 Verification email sent again! Check your inbox.')
      }
    } catch (err) {
      setResendMessage('❌ Failed to resend email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6">
      <div className={dialogStyles.paperDialog}>
        {/* Paper texture overlay */}
        <div className={dialogStyles.paperTexture}></div>

        {/* Yellow transparent tape */}
        <div className={dialogStyles.yellowTape}></div>

        {/* Torn edge effect */}
        <div className={dialogStyles.tornEdge}></div>

        <div className={dialogStyles.contentWrapper}>
          <div className="text-center space-y-6">
            {/* Email icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-stone-800">Check Your Email</h2>
              <p className="text-stone-600">
                We've sent a verification link to
              </p>
              <p className="font-semibold text-stone-800 break-all">
                {email}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-stone-600">
                Click the link in the email to verify your account. After clicking, you'll be automatically signed in and redirected back to your budget.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  💡 Don't see the email? Check your spam folder or try resending.
                </p>
              </div>
            </div>

            {resendMessage && (
              <div className={cn(
                "p-3 rounded-lg text-sm",
                resendMessage.includes('❌')
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-green-50 border border-green-200 text-green-800"
              )}>
                {resendMessage}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? '🔄 Sending...' : '📧 Resend Email'}
              </Button>

              <Button
                onClick={onBackToSignIn}
                variant="ghost"
                className="w-full text-stone-600 hover:text-stone-800"
              >
                ← Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}