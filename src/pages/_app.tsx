import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { PlanningProvider } from '@/contexts/PlanningContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PlanningProvider>
        <SidebarProvider>
          <Component {...pageProps} />
        </SidebarProvider>
      </PlanningProvider>
    </AuthProvider>
  )
}