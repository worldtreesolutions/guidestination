
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"

export interface PlaceData {
  address: string
  lat: number
  lng: number
  placeId: string
}

interface PlacesAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onPlaceSelect: (placeData: PlaceData) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter an address",
  className,
  disabled = false
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load Google Maps API script
  useEffect(() => {
    // Check if the script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsLoaded(true)
    document.head.appendChild(script)

    return () => {
      // Clean up script if component unmounts before script loads
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Initialize autocomplete when script is loaded and input is available
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["establishment", "geocode"],
      fields: ["address_components", "formatted_address", "geometry", "place_id"]
    })

    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace()
      
      if (!place || !place.geometry || !place.geometry.location) {
        console.error("Invalid place object:", place)
        return
      }

      const placeData: PlaceData = {
        address: place.formatted_address || "",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id || ""
      }

      onChange(placeData.address)
      onPlaceSelect(placeData)
    })

    return () => {
      if (google && google.maps && listener) {
        google.maps.event.removeListener(listener)
      }
    }
  }, [isLoaded, onChange, onPlaceSelect])

  return (
    <Input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      disabled={disabled || !isLoaded}
    />
  )
}
