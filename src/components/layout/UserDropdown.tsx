import { useState } from "react"
import { useRouter } from "next/router"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Heart, Settings, LogOut, Calendar } from "lucide-react"

export default function UserDropdown() {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToTab = (tab: string) => {
    router.push(`/profile?tab=${tab}`)
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white">
              {getInitials(user.email || "U")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{t('nav.myAccount')}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigateToTab("overview")}>
          <User className="mr-2 h-4 w-4" />
          <span>{t('nav.profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigateToTab("bookings")}>
          <Calendar className="mr-2 h-4 w-4" />
          <span>{t('nav.myBookings')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigateToTab("wishlist")}>
          <Heart className="mr-2 h-4 w-4" />
          <span>{t('nav.wishlist')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigateToTab("settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('nav.settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? t('nav.signingOut') : t('nav.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
