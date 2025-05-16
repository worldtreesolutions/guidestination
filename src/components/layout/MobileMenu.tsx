import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageSelector } from "./LanguageSelector"
import Image from "next/image"

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
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
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
            <Image src="/wts-logo-maq82ya8.png" alt="Logo" width={36} height={36} />
            <span className="font-bold">Guidestination</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <div className="grid gap-2 py-6 px-6"> {/* Added px-6 for consistency */}
          <Link
            href="/activities"
            className="flex w-full items-center py-2 text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            {t("nav.activities")}
          </Link>
          <Link
            href="/recommendation"
            className="flex w-full items-center py-2 text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            {t("nav.recommendation")}
          </Link>
          <Link
            href="/partner"
            className="flex w-full items-center py-2 text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            {t("nav.partner")}
          </Link>
          <Link
            href="https://3000-sandbox-63cb7384.h1038.daytona.work/admin"
            target="_blank"
            className="flex w-full items-center py-2 text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            Admin Portal
          </Link>
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