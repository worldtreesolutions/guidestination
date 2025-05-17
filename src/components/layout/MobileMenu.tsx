
import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
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
    { href: "/activity-owner", label: "Partner Area" }
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
            <MountainIcon className="h-6 w-6" />
            <span className="font-bold">Guidestination</span>
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
                router.pathname === link.href ? "text-primary" : ""
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
                className="justify-start p-2 h-auto font-medium"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link
              href="/dashboard/login"
              className="flex w-full items-center py-2 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
