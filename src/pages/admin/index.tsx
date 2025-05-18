
import { useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"

export default function AdminRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the admin login page
    window.location.href = "/admin/login"
  }, [])

  return (
    <>
      <Head>
        <title>Redirecting to Admin Portal</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting to Admin Portal</h1>
          <p>Please wait...</p>
        </div>
      </div>
    </>
  )
}
