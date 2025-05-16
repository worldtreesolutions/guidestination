import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageSelector } from "./LanguageSelector"
import Image from "next/image"
import { useRouter } from "next/router"

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { user, signOut, loading, isAdmin } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const navLinks = [
    { href: "/", labelKey: "nav.home" },
    { href: "/recommendation", labelKey: "nav.recommend" },
    { href: "/planning", labelKey: "nav.planning" },
    { href: "/activity-owner", labelKey: "nav.partnerArea" },
    { href: "/admin/dashboard", labelKey: "nav.adminPortal", adminOnly: true }
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
            <Image src="/wts-logo-maq82ya8.png" alt="Logo" width={36} height={36} />
            <span className="font-bold">Guidestination</span>
          </Link>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </SheetClose>
        </div>
        <div className="grid gap-2 py-6 px-6"> {/* Added px-6 for consistency */}
          {navLinks.map((link) => {
            if (link.adminOnly && !isAdmin) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex w-full items-center py-2 text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                {t(link.labelKey)}
              </Link>
            )
          })}
          {user ? (
            <Link
              href="/dashboard"
              className="flex w-full items-center py-2 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              {t("nav.dashboard")}
            </Link>
          ) : (
            <Link
              href="/dashboard/login"
              className="flex w-full items-center py-2 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              {t("nav.login")}
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}