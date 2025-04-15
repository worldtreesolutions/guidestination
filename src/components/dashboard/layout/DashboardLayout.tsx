
import { ReactNode, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { 
  Menu,
  LogOut
} from "lucide-react"
import { DashboardSidebar } from './DashboardSidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout();
    router.push("/dashboard/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="flex h-16 items-center px-4 sm:px-6">
          {isMobile && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[240px]">
                <DashboardSidebar />
              </SheetContent>
            </Sheet>
          )}
          
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#22C55E] hidden sm:inline-block">
                Guidestination
              </span>
              <span className="text-lg font-bold text-[#22C55E] sm:hidden">
                GD
              </span>
              <span className="text-sm font-medium">Provider Dashboard</span>
            </Link>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                      <AvatarFallback>{getInitials(user.displayName || "User")}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex">
        <div className="hidden md:block w-[240px] shrink-0">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <DashboardSidebar />
          </div>
        </div>
        <main className="flex-1 py-6 px-4 sm:px-6 md:px-8">
          {children}
        </main>
      </div>
      
      <footer className="border-t py-4 px-4 sm:px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Guidestination. All rights reserved.</p>
      </footer>
    </div>
  );
}
