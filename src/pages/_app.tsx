
import type { AppProps } from "next/app"
import { AuthProvider } from "@/contexts/AuthContext"
import { PlanningProvider } from "@/contexts/PlanningContext"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { Toaster } from "@/components/ui/toaster"
import "@/styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <PlanningProvider>
          <Component {...pageProps} />
          <Toaster />
        </PlanningProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}
