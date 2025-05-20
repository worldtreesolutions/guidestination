
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
  LogOut,
  MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

interface SidebarNavItemProps {
  href: string
  icon: React.ReactNode
  title: string
  badge?: number
}

const SidebarNavItem = ({ href, icon, title, badge }: SidebarNavItemProps) => {
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
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E] text-[10px] font-medium text-white">
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
    <div className="flex flex-col h-full border-r bg-background">
      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              badge={item.badge}
            />
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
         <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
           <LogOut className="mr-2 h-4 w-4" />
           Logout
         </Button>
      </div>
    </div>
  )
}
