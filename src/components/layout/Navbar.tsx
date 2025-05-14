
import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { MobileMenu } from "./MobileMenu"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/AuthContext"; 
import { Button } from "@/components/ui/button"; 

export function Navbar() {
  const isMobile = useIsMobile()
  const { user, logout } = useAuth(); 

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[2000px] mx-auto">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 mr-6">
              <span className="text-xl font-bold">Guidestination</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <NavigationMenu>
                <NavigationMenuList className="space-x-1 lg:space-x-4 flex-wrap justify-center">
                  <NavigationMenuItem>
                    <Link href="/recommendation" legacyBehavior passHref>
                      <NavigationMenuLink className="inline-flex h-10 items-center justify-center rounded-md bg-transparent px-2 lg:px-4 py-2 text-sm font-medium transition-colors hover:bg-[#ededed] hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                        AI Planning
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/activity-owner" legacyBehavior passHref>
                      <NavigationMenuLink className="inline-flex h-10 items-center justify-center rounded-md bg-transparent px-2 lg:px-4 py-2 text-sm font-medium transition-colors hover:bg-[#ededed] hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                        List Your Activities
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/partner" legacyBehavior passHref>
                      <NavigationMenuLink className="inline-flex h-10 items-center justify-center rounded-md bg-transparent px-2 lg:px-4 py-2 text-sm font-medium transition-colors hover:bg-[#ededed] hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                        Become a Partner
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/dashboard/login" legacyBehavior passHref>
                      <NavigationMenuLink className="inline-flex h-10 items-center justify-center rounded-md bg-transparent px-2 lg:px-4 py-2 text-sm font-medium transition-colors hover:bg-[#ededed] hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                        Provider Dashboard
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Button variant="ghost" onClick={logout} className="hover:bg-[#ededed] hover:text-accent-foreground">
                Logout
              </Button>
            ) : (
              <Link href="/dashboard/login" passHref legacyBehavior>
                <a className="hidden md:inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-[#ededed] hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  Login
                </a>
              </Link>
            )}
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
