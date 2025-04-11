
import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { MobileMenu } from "./MobileMenu"
import { useIsMobile } from "@/hooks/use-mobile"

export function Navbar() {
  const isMobile = useIsMobile()

  return (
    <header className="border-b bg-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-[#22C55E]">Guidestination</span>
          </Link>
          
          {!isMobile ? (
            <NavigationMenu className="flex-1 flex justify-center">
              <NavigationMenuList className="space-x-4">
                <NavigationMenuItem>
                  <Link href="/recommendation" legacyBehavior passHref>
                    <NavigationMenuLink className="inline-flex h-10 items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#22C55E] hover:text-white focus:bg-[#22C55E] focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      AI Planning
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/activity-owner" legacyBehavior passHref>
                    <NavigationMenuLink className="inline-flex h-10 items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#22C55E] hover:text-white focus:bg-[#22C55E] focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      List Your Activities
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/partner" legacyBehavior passHref>
                    <NavigationMenuLink className="inline-flex h-10 items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#22C55E] hover:text-white focus:bg-[#22C55E] focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      Become a Partner
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/activity-owner/dashboard" legacyBehavior passHref>
                    <NavigationMenuLink className="inline-flex h-10 items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#22C55E] hover:text-white focus:bg-[#22C55E] focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      Provider Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : null}
          
          <div className="flex items-center space-x-4">
            {!isMobile ? (
              <Link href="/activity-owner/login" className="inline-flex h-10 items-center justify-center rounded-md bg-[#22C55E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1EA34D] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2">
                Login
              </Link>
            ) : null}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
