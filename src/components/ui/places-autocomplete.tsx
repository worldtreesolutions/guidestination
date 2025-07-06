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
  const [inputValue, setInputValue] = useState(value);
  const isPlaceSelection = useRef(false);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const onPlaceSelectRef = useRef(onPlaceSelect);
  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

  // Sync external value changes with internal state
  useEffect(() => {
    if (value !== inputValue && !isPlaceSelection.current) {
      setInputValue(value);
    }
  }, [value, inputValue]);

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

      if (placeChangedListener.current) {
        placeChangedListener.current.remove();
      }
      
      placeChangedListener.current = instance.addListener(
        "place_changed",
        () => {
          const place = autocompleteRef.current?.getPlace();
          if (!place || !place.geometry || !place.geometry.location) {
            return;
          }
          
          isPlaceSelection.current = true;
          
          const placeData: PlaceData = {
            address: place.formatted_address || place.name || "",
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: place.place_id || "",
          };
          
          setInputValue(placeData.address);
          onChangeRef.current(placeData.address);
          onPlaceSelectRef.current(placeData);
          
          // Reset the flag after a short delay
          setTimeout(() => {
            isPlaceSelection.current = false;
          }, 100);
        }
      );
    }
  }, [isLoaded]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChangeRef.current(newValue);
  };

  useEffect(() => {
    return () => {
      if (placeChangedListener.current) {
        placeChangedListener.current.remove();
      }
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

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
      value={inputValue}
      onChange={handleInputChange}
      placeholder={isLoaded ? placeholder : "Loading Google Places..."}
      className={className}
      disabled={disabled || !isLoaded}
    />
  );
};

export const PlacesAutocomplete = React.memo(PlacesAutocompleteComponent);
