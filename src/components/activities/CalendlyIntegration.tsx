
import { useEffect } from "react"
import { loadScript } from "@calendly/embed-widget"

interface CalendlyIntegrationProps {
  url: string // L'URL Calendly du propriétaire de l'activité
  prefill?: {
    name?: string
    email?: string
    guests?: number
  }
}

export const CalendlyIntegration = ({ url, prefill }: CalendlyIntegrationProps) => {
  useEffect(() => {
    loadScript();
    // Initialise Calendly widget
    (window as any).Calendly.initInlineWidget({
      url: url,
      parentElement: document.getElementById('calendly-booking-widget'),
      prefill: prefill,
      styles: {
        height: '650px'
      }
    });
  }, [url, prefill]);

  return (
    <div id="calendly-booking-widget" className="w-full min-h-[650px] rounded-lg overflow-hidden" />
  )
}
