
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/router"
import React from "react"
import { LanguageSelector } from "./LanguageSelector"

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    setOpen(false)
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/activities", label: "Activities" },
    { href: "/planning", label: "My Planning" },
    { href: "/activity-owner", label: "List Your Activities" },
    { href: "/admin/login", label: "Admin Portal" },
    { href: "/dashboard/login", label: "Provider Dashboard" },
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
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <Image
              src="/logo-masdxep0.png"
              alt="Guidestination Logo"
              width={180}
              height={32}
              priority
            />
          </Link>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </SheetClose>
        </div>
        <div className="grid gap-2 py-6 px-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex w-full items-center py-2 text-sm font-medium ${
                router.pathname === link.href ? "text-primary" : "text-foreground/60 hover:text-primary"
              }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex w-full items-center py-2 text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <Button 
                variant="ghost" 
                className="justify-start p-2 h-auto font-medium text-sm text-foreground/60 hover:text-primary"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link
              href="/dashboard/login"
              className="flex w-full items-center py-2 text-sm font-medium text-foreground/60 hover:text-primary"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          )}
          <div className="mt-4 border-t pt-4">
            <LanguageSelector />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
