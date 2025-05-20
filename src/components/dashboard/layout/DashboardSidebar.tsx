
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router"
import { useAuth } from "@/contexts/AuthContext"
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  DollarSign, 
  Settings, 
  LogOut,
  Menu,
  Package,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardSidebar() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/dashboard/login")
  }

  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`)
  }

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard/overview",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: isActive("/dashboard/overview"),
    },
    {
      name: "Activities",
      href: "/dashboard/activities",
      icon: <Package className="h-5 w-5" />,
      active: isActive("/dashboard/activities"),
    },
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: <CalendarDays className="h-5 w-5" />,
      active: isActive("/dashboard/bookings"),
    },
    {
      name: "Customers",
      href: "/dashboard/customers",
      icon: <Users className="h-5 w-5" />,
      active: isActive("/dashboard/customers"),
    },
    {
      name: "Revenue",
      href: "/dashboard/revenue",
      icon: <DollarSign className="h-5 w-5" />,
      active: isActive("/dashboard/revenue"),
    },
    {
      name: "Inbox",
      href: "/dashboard/inbox",
      icon: <MessageSquare className="h-5 w-5" />,
      active: isActive("/dashboard/inbox"),
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      active: isActive("/dashboard/settings"),
    },
  ]

  return (
    <div className="flex h-screen flex-col bg-white border-r">
      <div className="p-4 border-b">
        <Link href="/dashboard/overview" className="flex items-center">
          <Image
            src="/logo-masdxep0.png"
            alt="Guidestination"
            width={180}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                item.active 
                  ? "bg-[#ededed] text-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
