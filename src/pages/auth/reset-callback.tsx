import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ResetCallback() {
  const router = useRouter()

  useEffect(() => {
    // Read hash fragment and move tokens to query string if present
    const hash = typeof window !== 'undefined' ? window.location.hash : ''

    if (!hash) {
      // No fragment, just redirect to reset page (will show missing token)
      router.replace('/auth/reset-password')
      return
    }

    try {
      const params = new URLSearchParams(hash.replace(/^#/, ''))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      const q = new URLSearchParams()
      if (access_token) q.set('access_token', access_token)
      if (refresh_token) q.set('refresh_token', refresh_token)

      const target = `/auth/reset-password?${q.toString()}`
      router.replace(target)
    } catch (e) {
      router.replace('/auth/reset-password')
    }
  }, [router])

  return <div className="min-h-screen flex items-center justify-center">Redirecting…</div>
}
