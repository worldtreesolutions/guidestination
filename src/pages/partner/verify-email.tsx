
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Mail } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function VerifyEmailPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the current session to check if user is verified
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setVerificationStatus('error')
          setMessage('Failed to verify email. Please try again.')
          return
        }

        if (session?.user?.email_confirmed_at) {
          setVerificationStatus('success')
          setMessage('Email verified successfully! You can now access your partner dashboard.')
          
          // Redirect to partner dashboard after 3 seconds
          setTimeout(() => {
            router.push('/partner/dashboard')
          }, 3000)
        } else {
          setVerificationStatus('error')
          setMessage('Email verification pending. Please check your email and click the verification link.')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setVerificationStatus('error')
        setMessage('An error occurred during email verification.')
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setVerificationStatus('success')
        setMessage('Email verified successfully! Redirecting to your dashboard...')
        setTimeout(() => {
          router.push('/partner/dashboard')
        }, 2000)
      }
    })

    handleEmailVerification()

    return () => subscription.unsubscribe()
  }, [router])

  const resendVerificationEmail = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: '', // Will use the current user's email
        options: {
          emailRedirectTo: `${window.location.origin}/partner/verify-email`
        }
      })

      if (error) {
        alert('Failed to resend verification email. Please try again.')
      } else {
        alert('Verification email sent! Please check your inbox.')
      }
    } catch (error) {
      console.error('Resend error:', error)
      alert('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
              {verificationStatus === 'loading' && <Mail className="h-8 w-8 text-blue-500 animate-pulse" />}
              {verificationStatus === 'success' && <CheckCircle className="h-8 w-8 text-green-500" />}
              {verificationStatus === 'error' && <XCircle className="h-8 w-8 text-red-500" />}
            </div>
            <CardTitle>
              {verificationStatus === 'loading' && 'Verifying Email...'}
              {verificationStatus === 'success' && 'Email Verified!'}
              {verificationStatus === 'error' && 'Verification Required'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{message}</p>
            
            {verificationStatus === 'error' && (
              <div className="space-y-3">
                <Button onClick={resendVerificationEmail} variant="outline" className="w-full">
                  Resend Verification Email
                </Button>
                <Button onClick={() => router.push('/partner')} variant="ghost" className="w-full">
                  Back to Registration
                </Button>
              </div>
            )}

            {verificationStatus === 'success' && (
              <Button onClick={() => router.push('/partner/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
