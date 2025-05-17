
import Link from "next/link"
import MobileMenu from "./MobileMenu"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/router"
import React from "react"

function MountainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}

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
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <MountainIcon className="h-6 w-6" />
          <span className="font-bold sm:inline-block">Guidestination</span>
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
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* LanguageSelector was here */}
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
