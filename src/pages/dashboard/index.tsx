
import { useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"

export default function DashboardIndexPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard/login")
      return
    }
    
    // Redirect to the main dashboard page
    router.push("/dashboard/overview")
  }, [isAuthenticated, router])

  return (
    <>
      <Head>
        <title>Activity Provider Dashboard - Guidestination</title>
        <meta name="description" content="Manage your activities and bookings" />
      </Head>

      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Redirecting to dashboard...</p>
        </div>
      </DashboardLayout>
    </>
  )
}
