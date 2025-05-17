
import Link from "next/link"
import Image from "next/image"
import MobileMenu from "./MobileMenu"
import { LanguageSelector } from "./LanguageSelector"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/router"
import React from "react"

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/activities", label: "Activities" },
    { href: "/planning", label: "My Planning" },
    { href: "/activity-owner", label: "Partner Area" }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center">
          <Image
            src="/logo-masdxep0.png"
            alt="Guidestination Logo"
            width={180}
            height={32}
            priority
          />
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`transition-colors hover:text-foreground/80 ${
                router.pathname === link.href ? "text-primary" : "text-foreground/60"
              }`}
            >
              {link.label}
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
