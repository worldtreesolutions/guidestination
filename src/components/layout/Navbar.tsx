
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
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const navLinkClassName = "inline-flex h-10 w-full items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-[#ededed] hover:text-foreground focus:bg-[#ededed] focus:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center">
          <Image
            src="/logo-masdxep0.png"
            alt="Guidestination"
            width={180}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </Link>
        
        <div className="hidden md:flex flex-1 justify-center">
          <NavigationMenu className="max-w-full w-full">
            <NavigationMenuList className="flex w-full justify-center space-x-4">
              <NavigationMenuItem className="flex-1 max-w-[200px]">
                <Link href="/activity-owner" legacyBehavior passHref>
                  <NavigationMenuLink className={navLinkClassName}>
                    <span className="text-sm lg:text-base">List Your Activities</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem className="flex-1 max-w-[200px]">
                <Link href="/admin" legacyBehavior passHref>
                  <NavigationMenuLink className={navLinkClassName}>
                    <span className="text-sm lg:text-base">Admin Portal</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem className="flex-1 max-w-[200px]">
                <Link href="/dashboard/login" legacyBehavior passHref>
                  <NavigationMenuLink className={navLinkClassName}>
                    <span className="text-sm lg:text-base">Provider Dashboard</span>
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
