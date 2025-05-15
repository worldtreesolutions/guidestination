
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { PlanningProvider } from '@/contexts/PlanningContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { SidebarProvider } from '@/components/ui/sidebar'
import { LanguageProvider } from '@/contexts/LanguageContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PlanningProvider>
        <LanguageProvider>
          <SidebarProvider>
            <Component {...pageProps} />
          </SidebarProvider>
        </LanguageProvider>
      </PlanningProvider>
    </AuthProvider>
  )
}
