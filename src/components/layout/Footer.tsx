
import Link from "next/link"

export const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4">Guidestination</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted guide to authentic experiences in Chiang Mai.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3 sm:mb-4">For Partners</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/partners/hotels">Hotels</Link></li>
              <li><Link href="/partners/restaurants">Restaurants</Link></li>
              <li><Link href="/partners/airbnb">Airbnb Hosts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 sm:mb-4">For Providers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/providers/register">List Your Activity</Link></li>
              <li><Link href="/providers/dashboard">Provider Dashboard</Link></li>
              <li><Link href="/providers/analytics">Analytics</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 sm:mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/support">Support</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Guidestination. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
