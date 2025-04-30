import Link from "next/link"
import { useIsMobile } from '@/hooks/use-mobile'

export const Footer = () => {
  const isMobile = useIsMobile()
  
  return (
    <footer className='w-full border-t bg-background'>
      <div className='mx-auto w-full max-w-[2000px] px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-8 md:py-12'>
          <div>
            <h3 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base">Guidestination</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Your trusted guide to authentic experiences in Chiang Mai.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base">For Partners</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li><Link href="/partners/hotels" className="hover:text-[#22C55E] transition-colors">Hotels</Link></li>
              <li><Link href="/partners/restaurants" className="hover:text-[#22C55E] transition-colors">Restaurants</Link></li>
              <li><Link href="/partners/airbnb" className="hover:text-[#22C55E] transition-colors">Airbnb Hosts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base">For Providers</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li><Link href="/providers/register" className="hover:text-[#22C55E] transition-colors">List Your Activity</Link></li>
              <li><Link href="/providers/dashboard" className="hover:text-[#22C55E] transition-colors">Provider Dashboard</Link></li>
              <li><Link href="/providers/analytics" className="hover:text-[#22C55E] transition-colors">Analytics</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base">Contact</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li><Link href="/support" className="hover:text-[#22C55E] transition-colors">Support</Link></li>
              <li><Link href="/contact" className="hover:text-[#22C55E] transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-[#22C55E] transition-colors">About</Link></li>
            </ul>
          </div>
        </div>
        
        <div className='border-t py-6 md:flex md:items-center md:justify-between'>
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 text-center text-xs sm:text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Guidestination. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}