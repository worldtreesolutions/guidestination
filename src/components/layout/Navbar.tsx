
import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { MobileMenu } from "./MobileMenu"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { Button } from "@/components/ui/button"; // Import Button component

export function Navbar() {
  const isMobile = useIsMobile()
  const { user, logout } = useAuth(); // Get user state and logout function

  return (
    &lt;header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"&gt;
      &lt;div className="w-full"&gt;
        &lt;div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[2000px] mx-auto"&gt;
          &lt;div className="flex items-center"&gt;
            &lt;Link href="/" className="flex items-center gap-2 mr-6"&gt;
              &lt;span className="text-xl font-bold"&gt;Guidestination&lt;/span&gt;
            &lt;/Link&gt;
            
            &lt;nav className="hidden md:flex items-center gap-6"&gt;
              &lt;NavigationMenu&gt;
                &lt;NavigationMenuList className="space-x-1 lg:space-x-4 flex-wrap justify-center"&gt;
                  &lt;NavigationMenuItem&gt;
                    &lt;Link href="/recommendation" legacyBehavior passHref&gt;
                      &lt;NavigationMenuLink className="inline-flex h-10 items-center justify-center rounded-md bg-transparent px-2 lg:px-4 py-2 text-sm font-medium transition-colors hover:bg-[#ededed] hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"&gt;
                        AI Planning
                      &lt;/NavigationMenuLink&gt;
                    &lt;/Link&gt;
                  &lt;/NavigationMenuItem&gt;
                  &lt;NavigationMenuItem&gt;
                    &lt;Link href="/activity-owner" legacyBehavior passHref&gt;
                      &lt;NavigationMenuLink className="inline-flex h-10 items-center justify-center rounded-md bg-transparent px-2 lg:px-4 py-2 text-sm font-medium transition-colors hover:bg-[#ededed] hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"&gt;
                        List Your Activities
                      &lt;/NavigationMenuLink&gt;
                    &lt;/Link&gt;
                  &lt;/NavigationMenuItem&gt;
                  &lt;NavigationMenuItem&gt;
                    &lt;Link href="/partner" legacyBehavior passHref&gt;
                      &lt;NavigationMenuLink className="inline-flex h-10 items-center justify-center rounded-md bg-transparent px-2 lg:px-4 py-2 text-sm font-medium transition-colors hover:bg-[#ededed] hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"&gt;
                        Become a Partner
                      &lt;/NavigationMenuLink&gt;
                    &lt;/Link&gt;
                  &lt;/NavigationMenuItem&gt;
                  &lt;NavigationMenuItem&gt;
                    &lt;Link href="/dashboard/login" legacyBehavior passHref&gt;
                      &lt;NavigationMenuLink className="inline-flex h-10 items-center justify-center rounded-md bg-transparent px-2 lg:px-4 py-2 text-sm font-medium transition-colors hover:bg-[#ededed] hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"&gt;
                        Provider Dashboard
                      &lt;/NavigationMenuLink&gt;
                    &lt;/Link&gt;
                  &lt;/NavigationMenuItem&gt;
                &lt;/NavigationMenuList&gt;
              &lt;/NavigationMenu&gt;
            &lt;/nav&gt;
          &lt;/div&gt;
          
          &lt;div className="flex items-center gap-4"&gt;
            {user ? (
              &lt;Button variant="ghost" onClick={logout} className="hover:bg-[#ededed] hover:text-accent-foreground"&gt;
                Logout
              &lt;/Button&gt;
            ) : (
              &lt;Link href="/dashboard/login" passHref legacyBehavior&gt;
                &lt;a className="hidden md:inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-[#ededed] hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"&gt;
                  Login
                &lt;/a&gt;
              &lt;/Link&gt;
            )}
            &lt;div className="md:hidden"&gt;
              &lt;MobileMenu /&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/header&gt;
  )
}
