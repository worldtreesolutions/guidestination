
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

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-places-script";

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
    // Check if the script is already loaded by ID or if window.google.maps.places exists
    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID) || (window.google && window.google.maps && window.google.maps.places)) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsLoaded(true)
    script.onerror = () => console.error("Google Maps script could not be loaded.")
    document.head.appendChild(script)

    // No cleanup needed for the script tag itself if we're checking by ID,
    // as we don't want to remove it if other instances might need it.
    // The browser will handle one script with the same src.
  }, [])

  // Initialize autocomplete when script is loaded and input is available
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      return
    }
    
    if (autocompleteRef.current) { // Avoid re-initializing if already done
        return;
    }

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["establishment", "geocode"], // You can customize types e.g., ['address']
      fields: ["address_components", "formatted_address", "geometry", "place_id", "name"] // Added name
    })

    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace()
      
      if (!place || !place.geometry || !place.geometry.location) {
        console.warn("Autocomplete place_changed event: Invalid place object or missing geometry.", place)
        // Optionally, clear the input or notify the user if the selection is invalid
        // onChange(""); // Example: clear input if selection is not valid
        return
      }

      const placeData: PlaceData = {
        address: place.formatted_address || place.name || "",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id || ""
      }

      onChange(placeData.address) // Update the input field with the selected address
      onPlaceSelect(placeData)    // Pass the detailed place data to the parent
    })

    return () => {
      // Clean up the specific listener when the component unmounts or dependencies change
      if (window.google && window.google.maps && window.google.maps.event && listener) {
        google.maps.event.removeListener(listener);
      }
      // Do not remove autocompleteRef.current here as it might break if other instances are still active.
      // google.maps.event.clearInstanceListeners(inputRef.current); // Alternative cleanup
    }
  }, [isLoaded, onChange, onPlaceSelect]) // Ensure dependencies are correct

  return (
    <Input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)} // Allow manual typing
      placeholder={placeholder}
      className={className}
      disabled={disabled || !isLoaded} // Disable input if API not loaded or explicitly disabled
    />
  )
}
  