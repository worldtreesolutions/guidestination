
import { useRouter } from "next/router"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Plus,
} from "lucide-react"

export function DashboardSidebar() {
  const router = useRouter()
  const { signOut } = useAuth()

  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/dashboard/login")
  }

  const menuItems = [
    {
      href: "/dashboard/overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/activities",
      label: "Activities",
      icon: CalendarDays,
    },
    {
      href: "/dashboard/activities/new",
      label: "Create Activity",
      icon: Plus,
    },
    {
      href: "/dashboard/customers",
      label: "Customers",
      icon: Users,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <div className="w-64 min-h-screen bg-white border-r">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <Link href="/dashboard/overview">
            <div className="flex items-center space-x-2">
              <img
                src="/logo-masdxep0.png"
                alt="Logo"
                className="h-8 w-auto"
              />
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link href={item.href} legacyBehavior>
                    <a
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </a>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
