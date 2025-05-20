
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router"
import {
  BarChart3,
  Calendar,
  Home,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
  LogOut,
  MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useEffect, useState } from "react"

interface SidebarNavItemProps {
  href: string
  icon: React.ReactNode
  title: string
  badge?: number
  isCompact: boolean
}

const SidebarNavItem = ({ href, icon, title, badge, isCompact }: SidebarNavItemProps) => {
  const router = useRouter()
  // Match base path for nested routes (e.g., /dashboard/activities/* should highlight Activities)
  const isActive = router.pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
        "hover:bg-muted active:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-foreground/20",
        isActive
          ? "bg-[#ededed] text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div className="flex items-center justify-center w-5">
        {icon}
      </div>
      {!isCompact && <span className="flex-1">{title}</span>}
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ededed] text-[10px] font-medium text-foreground">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  )
}

export function DashboardSidebar() {
  const { signOut } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [isCompact, setIsCompact] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)

  // Handle window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      // Set compact mode for medium screens
      setIsCompact(window.innerWidth > 640 && window.innerWidth < 1024)
    }
    
    // Set initial values
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth)
      handleResize()
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push("/dashboard/login")
  }

  // Mock unread messages count - in a real app, this would come from a context or API
  const unreadMessages = 3

  const navItems = [
    {
      title: "Overview",
      href: "/dashboard/overview",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: "Activities",
      href: "/dashboard/activities",
      icon: <ListChecks className="h-5 w-5" />
    },
    {
      title: "Bookings",
      href: "/dashboard/bookings",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      title: "Inbox",
      href: "/dashboard/inbox",
      icon: <MessageSquare className="h-5 w-5" />,
      badge: unreadMessages
    },
    {
      title: "Revenue",
      href: "/dashboard/revenue",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      title: "Customers",
      href: "/dashboard/customers",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />
    }
  ]

  return (
    <div className={cn(
      "flex flex-col h-full border-r bg-background shadow-md transition-all duration-300",
      isCompact ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b">
        <div className={cn(
          "flex items-center",
          isCompact ? "justify-center" : "justify-center lg:justify-start"
        )}>
          {isCompact ? (
            <LayoutDashboard className="h-6 w-6" />
          ) : (
            <div className="relative h-8 w-full max-w-[180px]">
              <Image 
                src="/logo-masdxep0.png" 
                alt="Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4 px-2 sm:px-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              badge={item.badge}
              isCompact={isCompact}
            />
          ))}
        </nav>
      </div>
      <div className="mt-auto p-3 border-t">
        {isCompact ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-full h-10 flex items-center justify-center" 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
      </div>
    </div>
  )
}
