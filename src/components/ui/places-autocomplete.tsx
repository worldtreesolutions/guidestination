
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

export interface PlaceData {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (placeData: PlaceData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-places-script";

const PlacesAutocompleteComponent: React.FC<PlacesAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter an address",
  className,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const placeChangedListener = useRef<google.maps.MapsEventListener | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const onPlaceSelectRef = useRef(onPlaceSelect);
  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

  // Effect 1: Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }
    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      const intervalId = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsLoaded(true);
          clearInterval(intervalId);
        }
      }, 100);
      return () => clearInterval(intervalId);
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () =>
      console.error("Google Maps script could not be loaded.");
    document.head.appendChild(script);
  }, []);

  // Effect 2: Initialize Autocomplete and add listener
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google?.maps?.places) {
      return;
    }

    if (!autocompleteRef.current) { // Only initialize if no instance exists
      const instance = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["establishment", "geocode"],
        fields: [
          "address_components",
          "formatted_address",
          "geometry",
          "place_id",
          "name",
        ],
      });
      autocompleteRef.current = instance;

      // Remove any old listener before adding a new one (defensive)
      if (placeChangedListener.current) {
        placeChangedListener.current.remove();
      }
      placeChangedListener.current = instance.addListener(
        "place_changed",
        () => {
          const place = autocompleteRef.current?.getPlace();
          if (!place || !place.geometry || !place.geometry.location) {
            console.warn(
              "Autocomplete place_changed event: Invalid place object or missing geometry.",
              place
            );
            return;
          }
          const placeData: PlaceData = {
            address: place.formatted_address || place.name || "",
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: place.place_id || "",
          };
          onPlaceSelectRef.current(placeData);
        }
      );
    }
    // No cleanup in this effect that removes the listener or nulls the autocompleteRef
    // We want the instance and listener to persist as long as isLoaded is true.
  }, [isLoaded]); // Runs when isLoaded changes

  // Effect 3: Cleanup on unmount
  useEffect(() => {
    const currentInputNode = inputRef.current; // Capture for cleanup
    const currentAutocompleteInstance = autocompleteRef.current; // Capture
    const currentListener = placeChangedListener.current; // Capture

    return () => {
      if (currentListener) {
        currentListener.remove();
      }
      if (currentInputNode && window.google?.maps?.event) {
        google.maps.event.clearInstanceListeners(currentInputNode);
      }
      // While the Autocomplete class doesn't have a public 'dispose' method,
      // clearing listeners and nullifying the ref is the standard way to clean up.
      // If currentAutocompleteInstance is used, ensure it's the captured one.
      if (currentAutocompleteInstance && window.google?.maps?.event) {
         // Clear listeners from the autocomplete instance itself if any were directly attached
         // For 'place_changed', we handled it via placeChangedListener.current
      }
      autocompleteRef.current = null;
      placeChangedListener.current = null;
    };
  }, []); // Empty dependency array: cleanup runs only on unmount

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
  );
};

export const PlacesAutocomplete = React.memo(PlacesAutocompleteComponent);
