import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock } from "lucide-react"

interface ScheduleDate {
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  available: number;
  price?: number;
}

interface AvailabilityCalendarProps {
  availableDates: string[]
  scheduleData?: ScheduleDate[]
  selectedDate?: Date
  onDateSelect: (date: Date | undefined) => void
}

export function AvailabilityCalendar({ 
  availableDates, 
  scheduleData = [],
  selectedDate, 
  onDateSelect 
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Debug logging
  console.log("AvailabilityCalendar received:", {
    availableDates,
    scheduleData,
    availableDatesLength: availableDates.length,
    scheduleDataLength: scheduleData.length
  });

  // Convert string dates to Date objects, ensuring proper parsing
  const availableDateObjects = availableDates.map(dateStr => {
    // Handle YYYY-MM-DD format by splitting and creating a UTC date
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      // Create date in UTC to avoid timezone issues
      return new Date(Date.UTC(year, month - 1, day));
    }
    // Fallback for other formats, though YYYY-MM-DD is expected
    return new Date(dateStr);
  });

  console.log("Converted available date objects (UTC):", availableDateObjects);
  console.log("Available dates as strings:", availableDateObjects.map(d => d.toDateString()));

  // Check if a date is available by comparing year, month, and day
  const isDateAvailable = (date: Date) => {
    const isAvailable = availableDateObjects.some(availableDate => 
      availableDate.getFullYear() === date.getFullYear() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getDate() === date.getDate()
    );
    
    if (isAvailable) {
      console.log(`Date ${date.toDateString()} is available`);
    }
    
    return isAvailable;
  };

  // Disable dates that are not available or in the past
  const disabledDates = (date: Date) => {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0) // Compare in UTC
    
    const isPast = date < today;
    const isNotAvailable = !isDateAvailable(date);
    
    if (isPast) {
      console.log(`Date ${date.toDateString()} is in the past`);
    }
    if (isNotAvailable) {
      console.log(`Date ${date.toDateString()} is not available`);
    }
    
    return isPast || isNotAvailable;
  }

  // Custom modifiers for the calendar to highlight available dates
  const modifiers = {
    available: availableDateObjects,
  };

  const modifiersStyles = {
    available: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      fontWeight: 'bold'
    }
  };

  // Get schedule info for selected date
  const getSelectedDateSchedule = () => {
    if (!selectedDate) return null
    
    // Format selectedDate to YYYY-MM-DD to match scheduleData date format
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return scheduleData.find(schedule => schedule.date === dateStr)
  }

  const selectedSchedule = getSelectedDateSchedule()

  // Get unique time slots from all schedule data
  const getAvailableTimes = () => {
    if (scheduleData.length === 0) {
      return [
        { startTime: "09:00", endTime: "12:00" },
        { startTime: "14:00", endTime: "17:00" }
      ]
    }

    // Get unique time combinations
    const uniqueTimes = scheduleData.reduce((acc: any[], schedule) => {
      const timeSlot = `${schedule.startTime} - ${schedule.endTime}`
      if (!acc.find(t => `${t.startTime} - ${t.endTime}` === timeSlot)) {
        acc.push({
          startTime: schedule.startTime,
          endTime: schedule.endTime
        })
      }
      return acc
    }, [])

    return uniqueTimes.slice(0, 4) // Limit to 4 time slots for display
  }

  const availableTimes = getAvailableTimes()

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
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        className="rounded-md border"
        month={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      {selectedDate && selectedSchedule && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Selected Date Details</span>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Time:</span>
              <Badge variant="outline">
                {selectedSchedule.startTime} - {selectedSchedule.endTime}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Availability:</span>
              <span className="text-sm text-muted-foreground">
                {selectedSchedule.available} of {selectedSchedule.capacity} spots available
              </span>
            </div>
            {selectedSchedule.price && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Price:</span>
                <span className="text-sm font-semibold">
                  ฿{selectedSchedule.price.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {availableDates.length > 0 && !selectedDate && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Available Times</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {availableTimes.map((time, index) => (
              <Badge key={index} variant="outline" className="justify-center py-2">
                {time.startTime} - {time.endTime}
              </Badge>
            ))}
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
          <span>Available dates ({availableDates.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-muted rounded-full"></div>
          <span>Unavailable dates</span>
        </div>
      </div>
    </div>
  )
}
