import "@/styles/globals.css"
import type { AppProps } from "next/app"
import AuthProvider from "@/contexts/AuthContext"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { PlanningProvider } from "@/contexts/PlanningContext"
import { Toaster } from "@/components/ui/toaster"

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
