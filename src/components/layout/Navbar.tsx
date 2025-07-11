
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserDropdown from "./UserDropdown";
import MobileMenu from "./MobileMenu";
import { LanguageSelector } from "./LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { Menu } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              Guidestination
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary">
              Home
            </Link>
            <Link href="/activities" className="text-gray-700 hover:text-primary">
              Activities
            </Link>
            <Link href="/partner" className="text-gray-700 hover:text-primary">
              Partner Program
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
                <LanguageSelector />
            </div>
            <div className="hidden md:block">
                {user ? (
                <UserDropdown />
                ) : (
                <div className="flex items-center space-x-2">
                    <Link href="/auth/login">
                    <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link href="/auth/register">
                    <Button>Sign Up</Button>
                    </Link>
                </div>
                )}
            </div>
            <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </div>
          </div>
        </div>
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </nav>
  );
}
