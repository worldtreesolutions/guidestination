import { ReactNode, useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useAuth, User } from "@/contexts/AuthContext" // Import User type explicitly
import { Button } from "@/components/ui/button"
import {
  Menu,
  LogOut,
  Bell // Added Bell icon for notifications (optional)
} from "lucide-react"
import { DashboardSidebar } from "./DashboardSidebar" // Corrected import path
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/dashboard/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center w-full'>
        <div className='flex flex-col items-center gap-2'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }

  const handleLogout = async () => {
    await logout();
    router.push("/dashboard/login"); // Redirect to dashboard login
  };

  // Updated getInitials to use user_metadata
  const getInitials = (currentUser?: User | null) => {
    const name = currentUser?.user_metadata?.name;
    if (!name) return "U"; // Default to "U" if name is not available
    const names = name.split(" ");
    if (names.length === 1) return names[0][0].toUpperCase(); // Handle single name
    return (names[0][0] + names[names.length - 1][0]).toUpperCase(); // First and Last initial
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2 sticky top-0">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard/overview" className="flex items-center gap-2 font-semibold">
              {/* Optional: Add a small logo here */}
              <span className="">Provider Dashboard</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto">
             <DashboardSidebar />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col w-full">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 w-full">
          {/* Mobile Sidebar Trigger */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
               <DashboardSidebar />
            </SheetContent>
          </Sheet>

          {/* Optional: Header Content (e.g., Search Bar) */}
          <div className="w-full flex-1">
            {/* Search bar could go here */}
          </div>

          {/* User Dropdown - Fixed the user check */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    {/* Removed AvatarImage as photoURL is not available */}
                    <AvatarFallback>{getInitials(user)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.user_metadata?.name || "My Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        {/* Page Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 w-full">
          <div className="w-full max-w-[2000px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}