import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import MobileMenu from "./MobileMenu" // Changed to default import
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "./LanguageSelector"
import { useLanguage } from "@/contexts/LanguageContext"
import Image from "next/image"

export function Navbar() {
  const isMobile = useIsMobile()
  const { user, logout } = useAuth()
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/wts-logo-maq82ya8.png" alt="Logo" width={48} height={48} />
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/activities" className="transition-colors hover:text-foreground/80">
              {t('nav.activities')}
            </Link>
            <Link href="/recommendation" className="transition-colors hover:text-foreground/80">
              {t('nav.recommendation')}
            </Link>
            <Link href="/partner" className="transition-colors hover:text-foreground/80">
              {t('nav.partner')}
            </Link>
            <Link 
              href="https://3000-sandbox-63cb7384.h1038.daytona.work/admin" 
              target="_blank"
              className="transition-colors hover:text-foreground/80"
            >
              Admin Portal
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <LanguageSelector />
          <nav className="flex items-center space-x-2">
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  {t('nav.dashboard')}
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard/login">
                <Button variant="outline" size="sm">
                  {t('nav.login')}
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