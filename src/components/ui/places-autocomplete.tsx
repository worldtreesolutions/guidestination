
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
  onChange: (value: string) => void // This is RHF's field.onChange for manual input
  onPlaceSelect: (placeData: PlaceData) => void // Custom handler for when a place is selected
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
  const placeChangedListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const [isLoaded, setIsLoaded] = useState(false)

  const onPlaceSelectRef = useRef(onPlaceSelect);
  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

  // Effect to load the Google Maps API script
  useEffect(() => {
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

    return () => {
        const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
        // Only remove if it was our script and it hasn't loaded yet (isLoaded is false)
        // If isLoaded is true, it means the script loaded successfully and should remain.
        if (existingScript && !isLoaded) { 
            existingScript.remove();
        }
    }
  }, [isLoaded]) // Added isLoaded to dependency array to avoid re-running if script is already loaded by other means.

  // Effect to initialize the Google Autocomplete instance and add listeners
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      return; // Prerequisites not met
    }

    // Initialize Autocomplete only if it hasn't been already for this input
    if (!autocompleteRef.current) {
      const instance = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["establishment", "geocode"], 
        fields: ["address_components", "formatted_address", "geometry", "place_id", "name"]
      });
      autocompleteRef.current = instance;

      // Add the place_changed listener and store its handle
      if (placeChangedListenerRef.current) {
        placeChangedListenerRef.current.remove(); // Remove old listener if any
      }
      placeChangedListenerRef.current = instance.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (!place || !place.geometry || !place.geometry.location) {
          console.warn("Autocomplete place_changed event: Invalid place object or missing geometry.", place);
          return;
        }

        const placeData: PlaceData = {
          address: place.formatted_address || place.name || "",
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id || ""
        };
        onPlaceSelectRef.current(placeData); // Call the memoized callback from parent
      });
    }

    // Cleanup function for this effect
    return () => {
      // Remove the specific place_changed listener
      if (placeChangedListenerRef.current) {
        placeChangedListenerRef.current.remove();
        placeChangedListenerRef.current = null;
      }
      
      // Clear any other Google Maps listeners from the input element itself
      // This is important if the input element is being removed/re-created
      // or if the component unmounts.
      const currentInputNode = inputRef.current; // Capture for cleanup closure
      if (currentInputNode && window.google && window.google.maps && window.google.maps.event) {
        google.maps.event.clearInstanceListeners(currentInputNode);
      }
      
      // When the component unmounts, we can also nullify the autocompleteRef
      // so that if it remounts (e.g. due to conditional rendering), it gets a fresh instance.
      autocompleteRef.current = null; 
    };
  }, [isLoaded]); // Dependency: This effect runs when `isLoaded` changes.

  return (
    <Input
      ref={inputRef}
      type="text"
      value={value} // Controlled by React Hook Form
      onChange={(e) => {
        onChange(e.target.value); // Propagate manual input changes to RHF
      }}
      placeholder={placeholder}
      className={className}
      disabled={disabled || !isLoaded} 
    />
  )
}
