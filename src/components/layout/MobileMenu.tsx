import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/router"
import React from "react"
import { LanguageSelector } from "./LanguageSelector"
import { CurrencySelector } from "./CurrencySelector"

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-t shadow-lg">
      <div className="px-4 py-4 space-y-4">
        {/* Language and Currency Selectors */}
        <div className="flex items-center justify-between">
          <LanguageSelector />
          <CurrencySelector />
        </div>
        
        {user ? (
          <div className="space-y-2">
            <Link href="/profile" className="block py-2 text-gray-700 hover:text-primary">
              Profile
            </Link>
            <Link href="/dashboard" className="block py-2 text-gray-700 hover:text-primary">
              Dashboard
            </Link>
            <button
              onClick={() => {
                authService.signOut();
                onClose();
              }}
              className="block w-full text-left py-2 text-gray-700 hover:text-primary"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link href="/auth/login" className="block">
              <Button variant="ghost" className="w-full justify-start">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register" className="block">
              <Button className="w-full">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
