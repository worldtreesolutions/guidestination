
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [isPlaceSelected, setIsPlaceSelected] = useState(false);

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

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.");
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      console.error("Google Maps script could not be loaded. Please check your API key and internet connection.");
    };
    document.head.appendChild(script);
  }, []);

  // Effect 2: Initialize Autocomplete and add listener
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google?.maps?.places) {
      return;
    }

    if (!autocompleteRef.current) {
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

      // Remove any old listener before adding a new one
      if (placeChangedListener.current) {
        placeChangedListener.current.remove();
      }
      
      placeChangedListener.current = instance.addListener(
        "place_changed",
        () => {
          const place = autocompleteRef.current?.getPlace();
          if (!place || !place.geometry || !place.geometry.location) {
            console.warn("Autocomplete place_changed event: Invalid place object or missing geometry.", place);
            return;
          }
          
          const placeData: PlaceData = {
            address: place.formatted_address || place.name || "",
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: place.place_id || "",
          };
          
          setIsPlaceSelected(true);
          onPlaceSelectRef.current(placeData);
          
          // Reset the flag after a short delay to allow normal typing again
          setTimeout(() => {
            setIsPlaceSelected(false);
          }, 100);
        }
      );
    }
  }, [isLoaded]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Only update if we're not in the middle of a place selection
    if (!isPlaceSelected) {
      onChange(newValue);
    }
  }, [onChange, isPlaceSelected]);

  // Effect 3: Cleanup on unmount
  useEffect(() => {
    const currentInputNode = inputRef.current;
    const currentListener = placeChangedListener.current;

    return () => {
      if (currentListener) {
        currentListener.remove();
      }
      if (currentInputNode && window.google?.maps?.event) {
        google.maps.event.clearInstanceListeners(currentInputNode);
      }
      autocompleteRef.current = null;
      placeChangedListener.current = null;
    };
  }, []);

  // Show loading state or API key missing state
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="p-2 border border-red-300 rounded bg-red-50 text-red-700 text-sm">
        Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
      </div>
    );
  }

  return (
    <Input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleInputChange}
      placeholder={isLoaded ? placeholder : "Loading Google Places..."}
      className={className}
      disabled={disabled || !isLoaded}
    />
  );
};

export const PlacesAutocomplete = React.memo(PlacesAutocompleteComponent);
