import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<'checking'|'success'|'error'|'none'>('checking')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = sessionStorage.getItem('supabaseConfirmToken')
    if (!token) {
      setStatus('none')
      return
    }

    // Verify token by calling Supabase Auth REST endpoint. We intentionally
    // avoid creating a client session here.
    ;(async () => {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        setStatus('error')
        try { sessionStorage.removeItem('supabaseConfirmToken'); sessionStorage.removeItem('supabaseConfirmRefresh') } catch (e) {}
        return
      }

      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: SUPABASE_ANON_KEY,
          },
        })

        if (!res.ok) {
          setStatus('error')
          try { sessionStorage.removeItem('supabaseConfirmToken'); sessionStorage.removeItem('supabaseConfirmRefresh') } catch (e) {}
          return
        }

        const body = await res.json()
        // body contains the user data when token is valid
        setUserEmail(body?.email || null)
        setStatus('success')

        // clear stored tokens after verification
        try { sessionStorage.removeItem('supabaseConfirmToken'); sessionStorage.removeItem('supabaseConfirmRefresh') } catch (e) {}
      } catch (err) {
        setStatus('error')
        try { sessionStorage.removeItem('supabaseConfirmToken'); sessionStorage.removeItem('supabaseConfirmRefresh') } catch (e) {}
      }
    })()
  }, [])

  return (
    <>
      <Head>
        <title>Email Confirmed - Guidestination</title>
      </Head>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          {status === 'checking' && <p>Confirming your email…</p>}
          {status === 'none' && (
            <>
              <h1 className="text-xl font-semibold mb-4">No confirmation token</h1>
              <p>If you just signed up, please check your email for the confirmation link.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <h1 className="text-xl font-semibold mb-4">Email confirmed</h1>
              {userEmail && <p className="mb-2">Confirmed: <strong>{userEmail}</strong></p>}
              <p className="mb-4">Your email address has been confirmed. Please sign in to continue.</p>
              <Link href="/auth/login" className="underline">Sign in</Link>
            </>
          )}
          {status === 'error' && <p>Failed to confirm email. Please try again later.</p>}
        </div>
      </div>
      <Footer />
    </>
  )
}
