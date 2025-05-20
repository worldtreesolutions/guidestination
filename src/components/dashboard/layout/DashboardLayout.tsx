
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
  const [isMobile, setIsMobile] = useState(false)
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [router.pathname, isMobile])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      
      if (!mobile) {
        setSidebarOpen(true)
      } else if (!sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    
    // Set initial state based on screen size
    if (typeof window !== 'undefined') {
      handleResize()
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [sidebarOpen])

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
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex h-full">
        {/* Sidebar - responsive */}
        <div 
          className={`fixed inset-0 z-40 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Overlay for mobile */}
          {sidebarOpen && isMobile && (
            <div 
              className="fixed inset-0 bg-black/20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
          
          <div className={`relative h-full z-50 ${sidebarOpen ? "block" : "hidden lg:block"}`}>
            <DashboardSidebar />
          </div>
        </div>
        
        {/* Main content - responsive */}
        <main className={`flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out ${
          sidebarOpen && !isMobile ? "lg:ml-0" : "ml-0"
        } pt-16 lg:pt-4 w-full`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
