
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/router"
import { DashboardSidebar } from "./DashboardSidebar"

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push("/dashboard/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
