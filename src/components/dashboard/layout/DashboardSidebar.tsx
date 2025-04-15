
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
  CreditCard,
  MessageSquare,
  HelpCircle
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
  const mainNavItems = [
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
      title: "Earnings",
      href: "/dashboard/earnings",
      icon: <BarChart3 className="h-5 w-5" />
    }
  ]

  const secondaryNavItems = [
    {
      title: "Customers",
      href: "/dashboard/customers",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />
    },
    {
      title: "Help & Support",
      href: "/dashboard/support",
      icon: <HelpCircle className="h-5 w-5" />
    }
  ]

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="py-4 px-3">
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => (
            <SidebarNavItem 
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
            />
          ))}
          
          <div className="mt-6 mb-2 px-3">
            <h3 className="text-xs font-medium text-muted-foreground">Management</h3>
          </div>
          
          {secondaryNavItems.map((item) => (
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
