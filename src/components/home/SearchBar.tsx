import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Calendar as CalendarIcon, Users } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface SearchBarProps {
  onSearch?: (params: { destination: string; date?: Date; guests: string }) => void;
}
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [destination, setDestination] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [guests, setGuests] = useState("1")

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ destination, date, guests });
    } else {
      console.log({ destination, date, guests });
    }
  }

  // Google Places Autocomplete setup
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) return;
    if (!inputRef.current) return;
    if (autocompleteRef.current) return;
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current!, {
      types: ["(cities)", "(regions)", "(countries)"],
      fields: ["formatted_address", "name", "geometry", "place_id", "address_components", "types"],
    });
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current!.getPlace();
      if (place && place.formatted_address) {
        setDestination(place.formatted_address);
      } else if (place && place.name) {
        setDestination(place.name);
      }
    });
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Destination (city or country)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-10 rounded-full"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="relative">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start pl-10 rounded-full text-left font-normal h-10"
              >
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {date ? date.toLocaleDateString() : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="relative">
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="rounded-full">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Guests" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Guest</SelectItem>
              <SelectItem value="2">2 Guests</SelectItem>
              <SelectItem value="3">3 Guests</SelectItem>
              <SelectItem value="4">4 Guests</SelectItem>
              <SelectItem value="5">5 Guests</SelectItem>
              <SelectItem value="6">6+ Guests</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button 
            onClick={handleSearch} 
            className="w-full h-10 rounded-full bg-gradient-to-r from-[#eb1d51] to-[#faaa15] hover:from-[#d11845] hover:to-[#e89c13] text-white border-0"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}
