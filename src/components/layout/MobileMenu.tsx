
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import authService from "@/services/authService"
import LanguageSelector from "./LanguageSelector"
import CurrencySelector from "./CurrencySelector"

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-t shadow-lg">
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <LanguageSelector />
          <CurrencySelector />
        </div>
        
        {user ? (
          <div className="space-y-2">
            <Link href="/profile" className="block py-2 text-gray-700 hover:text-primary" onClick={onClose}>
              Profile
            </Link>
            <Link href="/dashboard" className="block py-2 text-gray-700 hover:text-primary" onClick={onClose}>
              Dashboard
            </Link>
            <button
              onClick={() => {
                authService.signOut();
                onClose();
              }}
              className="block w-full text-left py-2 text-gray-700 hover:text-primary"
            >
              {t('nav.logout')}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link href="/auth/login" className="block" onClick={onClose}>
              <Button variant="ghost" className="w-full justify-start">
                {t('nav.login')}
              </Button>
            </Link>
            <Link href="/auth/register" className="block" onClick={onClose}>
              <Button className="w-full">{t('nav.register')}</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
