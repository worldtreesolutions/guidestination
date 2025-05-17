
    
import Link from "next/link"
import Image from "next/image"
import MobileMenu from "./MobileMenu"
import { LanguageSelector } from "./LanguageSelector"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/router"
import React from "react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const navLinkClassName = "inline-flex h-10 items-center justify-center rounded-md bg-transparent px-2 lg:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground hover:border hover:border-input focus:bg-accent focus:text-accent-foreground focus:border focus:border-input focus:outline-none disabled:pointer-events-none disabled:opacity-50"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center">
          <Image
            src="/logo-masdxep0.png"
            alt="Guidestination Logo"
            width={180}
            height={32}
            priority
          />
        </Link>
        
        <div className="hidden md:flex flex-grow justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/activity-owner" legacyBehavior passHref>
                    <NavigationMenuLink className={navLinkClassName}>
                      <span className="hidden lg:inline whitespace-nowrap">List Your Activities</span>
                      <span className="md:inline lg:hidden whitespace-nowrap">List Activities</span>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/partner" legacyBehavior passHref>
                    <NavigationMenuLink className={navLinkClassName}>
                      <span className="hidden lg:inline whitespace-nowrap">Become a Partner</span>
                      <span className="md:inline lg:hidden whitespace-nowrap">Partners</span>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/dashboard/login" legacyBehavior passHref>
                    <NavigationMenuLink className={navLinkClassName}>
                      <span className="hidden lg:inline whitespace-nowrap">Provider Dashboard</span>
                      <span className="md:inline lg:hidden whitespace-nowrap">Provider Hub</span>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <LanguageSelector />
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/dashboard/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </nav>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
  