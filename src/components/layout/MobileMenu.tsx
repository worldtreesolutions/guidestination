
import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

export function MobileMenu() {
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
        <div className="grid gap-2 py-6">
          <Link
            href="/activities"
            className="flex w-full items-center py-2 text-sm font-medium"
          >
            {t('nav.activities')}
          </Link>
          <Link
            href="/recommendation"
            className="flex w-full items-center py-2 text-sm font-medium"
          >
            {t('nav.recommendation')}
          </Link>
          <Link
            href="/partner"
            className="flex w-full items-center py-2 text-sm font-medium"
          >
            {t('nav.partner')}
          </Link>
          <Link
            href="https://3000-sandbox-63cb7384.h1038.daytona.work/admin"
            target="_blank"
            className="flex w-full items-center py-2 text-sm font-medium"
          >
            Admin Portal
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="flex w-full items-center py-2 text-sm font-medium"
            >
              {t('nav.dashboard')}
            </Link>
          ) : (
            <Link
              href="/dashboard/login"
              className="flex w-full items-center py-2 text-sm font-medium"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
