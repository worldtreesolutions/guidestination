import { useEffect } from "react"

interface CalendlyIntegrationProps {
  url: string // L'URL Calendly du propriétaire de l'activité
  prefill?: {
    name?: string
    email?: string
    guests?: number
  }
}

declare global {
  interface Window {
    Calendly: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement | null;
        prefill?: {
          name?: string;
          email?: string;
          guests?: number;
        };
        styles?: {
          height?: string;
        };
      }) => void;
    }
  }
}

export const CalendlyIntegration = ({ url, prefill }: CalendlyIntegrationProps) => {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (window.Calendly) {
      window.Calendly.initInlineWidget({
        url: url,
        parentElement: document.getElementById('calendly-booking-widget'),
        prefill: prefill,
        styles: {
          height: '650px'
        }
      })
    }
  }, [url, prefill])

  return (
    <div id='calendly-booking-widget' className='w-full min-h-[650px] rounded-lg overflow-hidden' />
  )
}