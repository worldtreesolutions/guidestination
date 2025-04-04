import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { PlanningProvider } from '@/contexts/PlanningContext'
import { AuthProvider } from '@/contexts/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PlanningProvider>
        <Component {...pageProps} />
      </PlanningProvider>
    </AuthProvider>
  )
}