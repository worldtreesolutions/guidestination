
import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { PlanningProvider } from "@/contexts/PlanningContext"
import AuthProvider from "@/contexts/AuthContext" // Corrected import
import { SidebarProvider } from "@/components/ui/sidebar"
import { LanguageProvider } from "@/contexts/LanguageContext"
import Head from "next/head"
import { Toaster } from "@/components/ui/toaster"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" type="image/png" href="/wts-logo-maq82ya8.png" />
      </Head>
      <AuthProvider>
        <LanguageProvider>
          <PlanningProvider>
            <SidebarProvider>
              <Component {...pageProps} />
              <Toaster />
            </SidebarProvider>
          </PlanningProvider>
        </LanguageProvider>
      </AuthProvider>
    </>
  )
}
