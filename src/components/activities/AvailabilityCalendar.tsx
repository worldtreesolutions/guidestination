
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock } from "lucide-react"

interface AvailabilityCalendarProps {
  availableDates: string[]
  selectedDate?: Date
  onDateSelect: (date: Date | undefined) => void
}

export function AvailabilityCalendar({ 
  availableDates, 
  selectedDate, 
  onDateSelect 
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Convert string dates to Date objects
  const availableDateObjects = availableDates.map(dateStr => new Date(dateStr))

  // Check if a date is available
  const isDateAvailable = (date: Date) => {
    return availableDateObjects.some(availableDate => 
      availableDate.toDateString() === date.toDateString()
    )
  }

  // Disable dates that are not available or in the past
  const disabledDates = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return date < today || !isDateAvailable(date)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4" />
        <span className="font-medium">Select Date</span>
      </div>

      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        disabled={disabledDates}
        className="rounded-md border"
        month={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      {availableDates.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Available Times</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="justify-center py-2">
              09:00 AM
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              02:00 PM
            </Badge>
          </div>
        </div>
      )}

      {availableDates.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            No available dates at the moment
          </p>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span>Available dates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-muted rounded-full"></div>
          <span>Unavailable dates</span>
        </div>
      </div>
    </div>
  )
}
