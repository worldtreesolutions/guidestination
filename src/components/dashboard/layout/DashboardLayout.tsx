
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/router"
import { DashboardSidebar } from "./DashboardSidebar"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [router.pathname])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    
    // Set initial state based on screen size
    handleResize()
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/dashboard/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white shadow-md"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex">
        {/* Sidebar - responsive */}
        <div 
          className={`fixed inset-0 z-40 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          <div className={`relative h-full w-64 z-50 ${sidebarOpen ? "block" : "hidden lg:block"}`}>
            <DashboardSidebar />
          </div>
        </div>
        
        {/* Main content - responsive */}
        <main className={`flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-64" : "ml-0"
        } pt-16 lg:pt-4`}>
          {children}
        </main>
      </div>
    </div>
  )
}
