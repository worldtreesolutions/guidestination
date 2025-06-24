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
import { Heart } from "lucide-react"

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const isMobile = useIsMobile()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Left spacer for centering logo */}
        <div className="flex-1"></div>
        
        {/* Centered Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-masdxep0.png"
            alt="Guidestination"
            width={350}
            height={65}
            priority
            className="h-12 sm:h-16 md:h-18 w-auto"
          />
        </Link>

        {/* Right side controls */}
        <div className="flex-1 flex items-center justify-end space-x-1 sm:space-x-4">
          {/* Wishlist Icon */}
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              0
            </span>
          </Button>
          
          <LanguageSelector />
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {user ? (
              <>
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
