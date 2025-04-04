import { ReactNode } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  DollarSign, 
  Settings, 
  LogOut,
  Users
} from "lucide-react"

interface ProviderLayoutProps {
  children: ReactNode;
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/activity-owner/login");
  };

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/activity-owner/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Activities",
      href: "/activity-owner/activities",
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      title: "Bookings",
      href: "/activity-owner/bookings",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Earnings",
      href: "/activity-owner/earnings",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: "Customers",
      href: "/activity-owner/customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/activity-owner/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex">
        <Sidebar
          className="hidden md:flex"
          navigationItems={navigationItems}
          user={{
            name: user?.businessName || "Activity Provider",
            email: user?.email || "",
            imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          }}
          accountNavigation={[
            {
              title: "Profile",
              href: "/activity-owner/settings",
              icon: <Settings className="h-5 w-5" />,
            },
            {
              title: "Logout",
              onClick: handleLogout,
              icon: <LogOut className="h-5 w-5" />,
            }
          ]}
        />
        
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}