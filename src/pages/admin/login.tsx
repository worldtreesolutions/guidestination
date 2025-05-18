
import { useEffect } from "react"
import Head from "next/head"

export default function AdminLoginPage() {
  useEffect(() => {
    // Redirect to the admin login page
    window.location.href = "/admin/login"
  }, [])

  return (
    <>
      <Head>
        <title>Redirecting to Admin Portal Login</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting to Admin Portal Login</h1>
          <p>Please wait...</p>
        </div>
      </div>
    </>
  )
}
