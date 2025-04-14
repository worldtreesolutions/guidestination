
import Link from "next/link"
import { useRouter } from "next/router"
import { 
  BarChart3, 
  Calendar, 
  Home, 
  LayoutDashboard, 
  ListChecks, 
  Settings, 
  Users 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarNavItemProps {
  href: string
  icon: React.ReactNode
  title: string
}

const SidebarNavItem = ({ href, icon, title }: SidebarNavItemProps) => {
  const router = useRouter()
  const isActive = router.pathname === href

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
  const navItems = [
    {
      title: "Dashboard",
      href: "/activity-owner/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: "Activities",
      href: "/activity-owner/activities",
      icon: <ListChecks className="h-5 w-5" />
    },
    {
      title: "Bookings",
      href: "/activity-owner/bookings",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      title: "Revenue",
      href: "/activity-owner/earnings",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      title: "Customers",
      href: "/activity-owner/customers",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Settings",
      href: "/activity-owner/settings",
      icon: <Settings className="h-5 w-5" />
    }
  ]

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="py-4 px-3 border-b">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#22C55E]">Guidestination</span>
        </Link>
      </div>
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
    </div>
  )
}
