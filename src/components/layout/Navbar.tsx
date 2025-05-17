
import Link from "next/link"
import { NavigationMenu } from "@/components/ui/navigation-menu"
import MobileMenu from "./MobileMenu"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "./LanguageSelector"
import { useLanguage } from "@/contexts/LanguageContext"
import Image from "next/image"
import { useRouter } from "next/router"

export function Navbar() {
  const isMobile = useIsMobile()
  const { t } = useLanguage()
  const { user, signOut, loading, isAdmin } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const navLinks = [
    { href: "/", labelKey: "nav.home" },
    { href: "/activities", labelKey: "nav.activities" },
    { href: "/planning", labelKey: "nav.planning" },
    { href: "/activity-owner", labelKey: "nav.partnerArea" }
  ]

  // Add admin link if user is admin
  if (isAdmin) {
    navLinks.push({ href: "/admin/dashboard", labelKey: "nav.adminPortal" })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-10 w-auto" />
          <span className="font-bold sm:inline-block">{t("nav.brand")}</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`transition-colors hover:text-foreground/80 ${
                router.pathname === link.href ? "text-primary" : ""
              }`}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <LanguageSelector />
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    {t("nav.dashboard")}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  {t("nav.signOut")}
                </Button>
              </>
            ) : (
              <Link href="/dashboard/login">
                <Button variant="outline" size="sm">
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
