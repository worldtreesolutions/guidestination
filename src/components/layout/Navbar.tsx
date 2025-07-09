import Link from "next/link"
import Image from "next/image"
import MobileMenu from "./MobileMenu"
import { LanguageSelector } from "./LanguageSelector"
import { useAuth } from "@/contexts/AuthContext"
import UserDropdown from "./UserDropdown"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/router"
import React from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { Heart } from "lucide-react"

export function Navbar() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const isMobile = useIsMobile()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">Guidestination</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Home
            </Link>
            <Link href="/activities" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Activities
            </Link>
            <Link href="/planning" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Planning
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
