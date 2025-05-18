
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

  // Effect to load the Google Maps API script (runs once on mount)
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }
    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      // Script tag exists, set up an interval to check for window.google.maps.places
      const intervalId = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsLoaded(true);
          clearInterval(intervalId);
        }
      }, 100);
      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error("Google Maps script could not be loaded.");
    document.head.appendChild(script);
    
    // No specific cleanup for the script tag itself, it's fine for it to remain.
  }, []); // Empty dependency array ensures this runs only once on mount

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
      autocompleteRef.current = instance; // Store the instance

      // Remove any old listener before adding a new one
      if (placeChangedListenerRef.current) {
        placeChangedListenerRef.current.remove();
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
        onPlaceSelectRef.current(placeData);
      });
    }

    // Cleanup function for this effect (runs on unmount or when isLoaded changes from true to false)
    return () => {
      if (placeChangedListenerRef.current) {
        placeChangedListenerRef.current.remove();
        placeChangedListenerRef.current = null;
      }
      
      const currentInputNode = inputRef.current; // Capture for cleanup
      if (autocompleteRef.current && currentInputNode && window.google && window.google.maps.event) {
        google.maps.event.clearInstanceListeners(currentInputNode);
      }
      autocompleteRef.current = null; 
    };
  }, [isLoaded]); // Re-run this effect if isLoaded changes.

  return (
    <Input
      ref={inputRef}
      type="text"
      value={value} 
      onChange={(e) => {
        onChange(e.target.value); 
      }}
      placeholder={placeholder}
      className={className}
      disabled={disabled || !isLoaded} 
    />
  )
}
