import { useEffect } from 'react'
import { useRouter } from 'next/router'

// This callback captures tokens that may be present in the URL hash (fragment)
// and stores them in sessionStorage so they are not visible in query strings
// or server logs. After storing, it redirects to the reset page without
// exposing tokens in the URL.
export default function ResetCallback() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hash = window.location.hash || ''
    if (!hash) {
      router.replace('/auth/reset-password')
      return
    }

    try {
      const params = new URLSearchParams(hash.replace(/^#/, ''))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (access_token) {
        try {
          sessionStorage.setItem('supabaseResetToken', access_token)
          if (refresh_token) sessionStorage.setItem('supabaseResetRefresh', refresh_token)
        } catch (e) {
          // ignore sessionStorage errors (private mode etc.)
        }
      }

      // Always navigate to reset-password without tokens in the URL
      router.replace('/auth/reset-password')
    } catch (e) {
      router.replace('/auth/reset-password')
    }
  }, [router])

  return <div className="min-h-screen flex items-center justify-center">Redirecting…</div>
}
