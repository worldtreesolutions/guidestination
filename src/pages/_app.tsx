import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { PlanningProvider } from '@/contexts/PlanningContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PlanningProvider>
      <Component {...pageProps} />
    </PlanningProvider>
  )
}