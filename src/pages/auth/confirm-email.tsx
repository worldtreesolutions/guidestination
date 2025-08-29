import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { supabase } from '@/integrations/supabase/client'

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<'checking'|'success'|'error'|'none'>('checking')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = sessionStorage.getItem('supabaseConfirmToken')
    if (!token) {
      setStatus('none')
      return
    }

    // We do not want to create a session here. Optionally, you could hit the
    // Supabase REST endpoint to verify the token. For now, display success and
    // clear the token so the user can sign in manually.
    try { sessionStorage.removeItem('supabaseConfirmToken'); sessionStorage.removeItem('supabaseConfirmRefresh') } catch (e) {}
    setStatus('success')
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
