import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import UserDropdown from "./UserDropdown";
import MobileMenu from "./MobileMenu";
import { LanguageSelector } from "./LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Menu } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { currency, setCurrency } = useCurrency();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Language selector and currency picker on desktop, empty on mobile */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:block">
              <LanguageSelector />
            </div>
            <div className="hidden md:block">
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm ml-2"
                aria-label="Select currency"
              >
                <option value="THB">THB ฿</option>
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
              </select>
            </div>
          </div>

          {/* Center - Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-mcyznoc4.png"
                alt="Guidestination"
                width={350}
                height={70}
                className="h-16 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Right side - Auth buttons and mobile menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              {user ? (
                <UserDropdown />
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost">{t('nav.login')}</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>{t('nav.register')}</Button>
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
