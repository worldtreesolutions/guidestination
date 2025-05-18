
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
  const placeChangedListenerRef = useRef<google.maps.MapsEventListener | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const onPlaceSelectRef = useRef(onPlaceSelect);
  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

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

  useEffect(() => {
    if (
      !isLoaded ||
      !inputRef.current ||
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places
    ) {
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

      if (placeChangedListenerRef.current) {
        placeChangedListenerRef.current.remove();
      }
      placeChangedListenerRef.current = instance.addListener(
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

    return () => {
      if (placeChangedListenerRef.current) {
        placeChangedListenerRef.current.remove();
        placeChangedListenerRef.current = null;
      }
      const currentInputNode = inputRef.current;
      if (
        autocompleteRef.current &&
        currentInputNode &&
        window.google &&
        window.google.maps.event
      ) {
        google.maps.event.clearInstanceListeners(currentInputNode);
      }
      autocompleteRef.current = null;
    };
  }, [isLoaded]);

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
