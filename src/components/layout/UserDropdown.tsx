
import { useState } from "react"
import { useRouter } from "next/router"
import { useAuth } from "@/contexts/AuthContext"
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

  const navigateTo = (path: string) => {
    router.push(path)
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
            <p className="text-sm font-medium leading-none">My Account</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigateTo("/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigateTo("/profile?tab=bookings")}>
          <Calendar className="mr-2 h-4 w-4" />
          <span>My Bookings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigateTo("/profile?tab=wishlist")}>
          <Heart className="mr-2 h-4 w-4" />
          <span>Wishlist</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigateTo("/profile?tab=settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
