
import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { PlanningProvider } from '@/contexts/PlanningContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { SidebarProvider } from '@/components/ui/sidebar'
import { LanguageProvider } from '@/contexts/LanguageContext'
import Head from "next/head"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PlanningProvider>
        <LanguageProvider>
          <SidebarProvider>
            <Head>
              <link rel="icon" type="image/png" href="/wts-logo-maq82ya8.png" />
            </Head>
            <Component {...pageProps} />
          </SidebarProvider>
        </LanguageProvider>
      </PlanningProvider>
    </AuthProvider>
  )
}
