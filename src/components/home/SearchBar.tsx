import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Calendar as CalendarIcon, Users } from "lucide-react"
import { useState } from "react"

export default function SearchBar() {
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState("")
  const [guests, setGuests] = useState("1")

  const handleSearch = () => {
    console.log({ destination, date, guests })
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
        </div>

        <div className="relative">
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="date"
              placeholder="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
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
          <Button onClick={handleSearch} className="w-full h-10 rounded-full">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}
