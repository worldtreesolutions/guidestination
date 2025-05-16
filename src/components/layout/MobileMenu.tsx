import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageSelector } from "./LanguageSelector"
import Image from "next/image"

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { t } = useLanguage()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col gap-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <Image
                src="/wts-logo-1-maq8hoxc.png"
                alt="Guidestination"
                width={160}
                height={35}
                className="h-7 w-auto"
                priority
              />
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <nav className="flex flex-col gap-4">
            <Link
              href="/recommendation"
              className="text-lg font-medium transition-colors hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {t("nav.aiPlanning")}
            </Link>
            <Link
              href="/activity-owner"
              className="text-lg font-medium transition-colors hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {t("nav.listActivities")}
            </Link>
            <Link
              href="/partner"
              className="text-lg font-medium transition-colors hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {t("nav.becomePartner")}
            </Link>
            <Link
              href="/dashboard/login"
              className="text-lg font-medium transition-colors hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {t("nav.providerDashboard")}
            </Link>
          </nav>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <span className="text-sm">Change Language</span>
            </div>
            {user ? (
              <Button
                variant="outline"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
              >
                {t("nav.logout")}
              </Button>
            ) : (
              <Link href="/dashboard/login" passHref onClick={() => setOpen(false)}>
                <Button className="w-full">{t("nav.login")}</Button>
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}