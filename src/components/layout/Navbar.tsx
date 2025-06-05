import Link from "next/link"
import Image from "next/image"
import MobileMenu from "./MobileMenu"
import { LanguageSelector } from "./LanguageSelector"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/router"
import React from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const isMobile = useIsMobile()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const navLinkClassName = "inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors hover:bg-[#ededed] hover:text-foreground focus:bg-[#ededed] focus:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8">
        <Link href="/" className="mr-2 sm:mr-6 flex items-center">
          <Image
            src="/logo-masdxep0.png"
            alt="Guidestination"
            width={280}
            height={52}
            priority
            className="h-10 sm:h-14 w-auto"
          />
        </Link>
        
        <div className="hidden md:flex flex-1 justify-center">
          <NavigationMenu className="max-w-full w-full">
            <NavigationMenuList className="flex w-full justify-center space-x-1 lg:space-x-4">
              <NavigationMenuItem>
                <Link href="/activity-owner" legacyBehavior passHref>
                  <NavigationMenuLink className={navLinkClassName}>
                    <span className="hidden lg:inline">{t("nav.listActivitiesFull")}</span>
                    <span className="lg:hidden">{t("nav.listActivities")}</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/partner" legacyBehavior passHref>
                  <NavigationMenuLink className={navLinkClassName}>
                    <span className="hidden lg:inline">{t("nav.becomePartnerFull")}</span>
                    <span className="lg:hidden">{t("nav.becomePartner")}</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/dashboard/login" legacyBehavior passHref>
                  <NavigationMenuLink className={navLinkClassName}>
                    {t("nav.providerDashboard")}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center justify-end space-x-1 sm:space-x-4">
          <LanguageSelector />
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size={isMobile ? "sm" : "sm"} className="text-xs sm:text-sm px-2 sm:px-4">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size={isMobile ? "sm" : "sm"} onClick={handleSignOut} className="text-xs sm:text-sm px-2 sm:px-4">
                  {t("nav.logout")}
                </Button>
              </>
            ) : (
              <Link href="/dashboard/login">
                <Button variant="outline" size={isMobile ? "sm" : "sm"} className="text-xs sm:text-sm px-2 sm:px-4">
                  {t("nav.login")}
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
