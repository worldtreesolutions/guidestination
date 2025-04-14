import { ReactNode, useState } from "react"
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
  Users,
  Menu
} from "lucide-react"
import { DashboardSidebar } from './DashboardSidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface ProviderLayoutProps {
  children: ReactNode;
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        {isMobile ? (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button 
                variant='outline' 
                size='icon' 
                className='fixed left-4 top-20 z-40 md:hidden'
              >
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='p-0 w-[240px]'>
              <DashboardSidebar />
            </SheetContent>
          </Sheet>
        ) : (
          <div className='hidden md:block w-[240px] shrink-0'>
            <div className='sticky top-16 h-[calc(100vh-4rem)]'>
              <DashboardSidebar />
            </div>
          </div>
        )}
        <main className='flex-1 py-6 px-4 sm:px-6 md:px-8'>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}