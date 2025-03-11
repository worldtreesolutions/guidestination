import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { ShoppingCart } from 'lucide-react'

export const Navbar = () => {
  return (
    <header className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50'>
      <div className='container flex h-16 items-center'>
        <div className='flex-1 flex justify-start'>
          <Link href='/' className='flex items-center space-x-2'>
            <span className='text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent tracking-tight'>
              Guidestination
            </span>
          </Link>
        </div>

        <div className='flex-1 flex justify-center'>
          <NavigationMenu>
            <NavigationMenuList className='space-x-2'>
              <NavigationMenuItem>
                <Link href='/activity-owner' legacyBehavior passHref>
                  <NavigationMenuLink className='group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50'>
                    List Your Activities
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href='/partner' legacyBehavior passHref>
                  <NavigationMenuLink className='group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50'>
                    Become a Partner
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className='flex-1 flex justify-end items-center space-x-4'>
          <Button variant='ghost' size='icon'>
            <ShoppingCart className='h-5 w-5' />
          </Button>
          <Button variant='outline' asChild>
            <Link href='/login'>Login</Link>
          </Button>
          <Button asChild>
            <Link href='/register'>Register</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}