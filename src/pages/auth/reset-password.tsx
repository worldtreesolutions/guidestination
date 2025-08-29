import Head from "next/head"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { supabase } from "@/integrations/supabase/client"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function parseTokenFromUrl() {
  if (typeof window === 'undefined') return null

  // Supabase may attach tokens in the hash (#access_token=...) or query string
  const hash = window.location.hash || ''
  const search = window.location.search || ''

  const params = new URLSearchParams(hash.replace(/^#/, ''))
  if (!params.has('access_token')) {
    // fallback to search
    const s = new URLSearchParams(search)
    if (s.has('access_token')) return { access_token: s.get('access_token'), refresh_token: s.get('refresh_token') }
    return null
  }

  return { access_token: params.get('access_token'), refresh_token: params.get('refresh_token') }
}

export default function ResetPasswordPage() {
  const [tokenInfo, setTokenInfo] = useState<{ access_token?: string | null, refresh_token?: string | null } | null>(null)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Prefer token from sessionStorage (set by reset-callback). Fall back to URL.
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('supabaseResetToken') : null
    if (stored) {
      setTokenInfo({ access_token: stored, refresh_token: typeof window !== 'undefined' ? sessionStorage.getItem('supabaseResetRefresh') : null })
      return
    }

    const t = parseTokenFromUrl()
    if (t && t.access_token) {
      setTokenInfo(t)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters long')
        setLoading(false)
        return
      }

      // attempt to update user password using the reset token via Supabase REST API
      const token = (typeof window !== 'undefined') ? sessionStorage.getItem('supabaseResetToken') || tokenInfo?.access_token : tokenInfo?.access_token
      if (!token) {
        setError('No reset token available')
        setLoading(false)
        return
      }

      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        setError('Missing Supabase configuration')
        setLoading(false)
        return
      }

      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        let body: any = null
        try { body = await res.json() } catch (e) {}
        const msg = body?.error_description || body?.message || 'Failed to update password'
        setError(msg)
        setLoading(false)
        return
      }

      // clear any stored tokens and ensure no session remains
      try { sessionStorage.removeItem('supabaseResetToken'); sessionStorage.removeItem('supabaseResetRefresh') } catch (e) {}
      try { await supabase.auth.signOut() } catch (e) {}

      setMessage('Your password has been updated. Please sign in with your new password.')
      setPassword('')
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Reset Password - Guidestination</title>
        <meta name="description" content="Reset your Guidestination password" />
      </Head>

      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Reset your password</h1>

          {!tokenInfo && (
            <div className="p-4 border rounded bg-yellow-50 text-yellow-900">
              <p className="mb-2">No recovery token was found in the URL.</p>
              <p>If you followed a password reset link from your email, please ensure the full URL (including the hash fragment) was preserved. Alternatively, request a new reset link.</p>
              <div className="mt-4">
                <Link href="/auth/forgot-password" className="text-sm underline">Request a new reset link</Link>
              </div>
            </div>
          )}

          {tokenInfo && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && <div className="p-3 bg-green-50 text-green-800 rounded">{message}</div>}
              {error && <div className="p-3 bg-red-50 text-red-800 rounded">{error}</div>}

              <div>
                <label className="block text-sm font-medium mb-1">New password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a new password" />
                <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters.</p>
              </div>

              <div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Updating...' : 'Set new password'}
                </Button>
              </div>

              <div className="text-center">
                <Link href="/auth/login" className="text-sm underline">Back to login</Link>
              </div>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
