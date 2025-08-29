import "@/styles/globals.css"

import type { AppProps } from "next/app"
import { useEffect } from "react"
import AuthProvider from "@/contexts/AuthContext"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { PlanningProvider } from "@/contexts/PlanningContext"
import { CartProvider } from "@/contexts/CartContext"
import { Toaster } from "@/components/ui/toaster"
import FloatingCart from "@/components/layout/FloatingCart"
import { CurrencyProvider } from "@/context/CurrencyContext"
import Script from "next/script"
import { supabase } from "@/integrations/supabase/client"
import { referralService } from "@/services/referralService"

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Handle auth state changes for referral claiming
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id) {
        try {
          // Attempt to claim any stored referral data
          const claimedReferral = await referralService.claimReferralForUser(session.user.id);
          
          if (claimedReferral) {
            console.log('Successfully claimed referral for establishment:', claimedReferral.establishment_id);
            // Optional: Show a success notification here
          }
        } catch (error) {
          console.error('Failed to claim referral on sign-in:', error);
          // Don't block the login flow
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
