import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ConfirmCallback() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hash = window.location.hash || ''
    if (!hash) {
      router.replace('/auth/confirm-email')
      return
    }

    try {
      const params = new URLSearchParams(hash.replace(/^#/, ''))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (access_token) {
        try { sessionStorage.setItem('supabaseConfirmToken', access_token) } catch (e) {}
        if (refresh_token) {
          try { sessionStorage.setItem('supabaseConfirmRefresh', refresh_token) } catch (e) {}
        }
      }

      router.replace('/auth/confirm-email')
    } catch (e) {
      router.replace('/auth/confirm-email')
    }
  }, [router])

  return <div className="min-h-screen flex items-center justify-center">Confirming…</div>
}
