
import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  const navItems = [
    { href: "/recommendation", label: "AI Planning" },
    { href: "/activity-owner", label: "List Your Activities" },
    { href: "/partner", label: "Become a Partner" },
    { href: "/activity-owner/dashboard", label: "Provider Dashboard" }
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80vw] sm:w-[350px] bg-black border-l border-gray-800">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
              <span className="text-xl font-bold text-[#22C55E]">Guidestination</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-white">
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          
          <nav className="flex-1">
            <ul className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className="block py-2 text-lg font-medium text-white hover:text-[#22C55E] transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-gray-800">
            <Link 
              href="/activity-owner/login" 
              className="block w-full py-3 text-center rounded-md bg-[#22C55E] text-white font-medium hover:bg-[#1EA34D] transition-colors"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
