import "@/styles/globals.css"

import type { AppProps } from "next/app"
import AuthProvider from "@/contexts/AuthContext"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { PlanningProvider } from "@/contexts/PlanningContext"
import { CartProvider } from "@/contexts/CartContext"
import { Toaster } from "@/components/ui/toaster"
import FloatingCart from "@/components/layout/FloatingCart"
import { CurrencyProvider } from "@/context/CurrencyContext"
import Script from "next/script"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />
      <AuthProvider>
        <LanguageProvider>
          <PlanningProvider>
            <CartProvider>
              <CurrencyProvider>
                <Component {...pageProps} />
                <FloatingCart />
                <Toaster />
              </CurrencyProvider>
            </CartProvider>
          </PlanningProvider>
        </LanguageProvider>
      </AuthProvider>
    </>
  );
}
