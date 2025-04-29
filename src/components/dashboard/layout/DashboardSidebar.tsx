
import Link from "next/link"
import { useRouter } from "next/router"
import {
  BarChart3,
  Calendar,
  Home,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
  LogOut // Added LogOut icon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button" // Added Button import
import { useAuth } from "@/contexts/AuthContext" // Added AuthContext import

interface SidebarNavItemProps {
  href: string
  icon: React.ReactNode
  title: string
}

const SidebarNavItem = ({ href, icon, title }: SidebarNavItemProps) => {
  const router = useRouter()
  // Match base path for nested routes (e.g., /dashboard/activities/* should highlight Activities)
  const isActive = router.pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-[#22C55E]/10 text-[#22C55E]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  )
}

export function DashboardSidebar() {
  const { logout } = useAuth() // Get logout function
  const router = useRouter() // Get router for logout redirect

  const handleLogout = async () => {
    await logout();
    router.push("/dashboard/login"); // Redirect to dashboard login after logout
  };

  const navItems = [
    {
      title: "Overview", // Renamed from Dashboard to Overview
      href: "/dashboard/overview", // Updated href
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: "Activities",
      href: "/dashboard/activities", // Updated href
      icon: <ListChecks className="h-5 w-5" />
    },
    {
      title: "Bookings",
      href: "/dashboard/bookings", // Updated href
      icon: <Calendar className="h-5 w-5" />
    },
    {
      title: "Revenue",
      href: "/dashboard/earnings", // Updated href
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      title: "Customers",
      href: "/dashboard/customers", // Updated href
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Settings",
      href: "/dashboard/settings", // Updated href
      icon: <Settings className="h-5 w-5" />
    }
  ]

  return (
    <div className="flex flex-col h-full border-r bg-background">
      {/* Removed the top Guidestination link/logo section */}
      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
            />
          ))}
        </nav>
      </div>
      {/* Add Logout Button at the bottom */}
      <div className="mt-auto p-4 border-t">
         <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
           <LogOut className="mr-2 h-4 w-4" />
           Logout
         </Button>
      </div>
    </div>
  )
}
