import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock } from "lucide-react"
import { ActivityScheduleInstance } from "@/types/activity"

interface AvailabilityCalendarProps {
  availableDates: string[]
  scheduleData?: ActivityScheduleInstance[]
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

  // Ensure availableDates is an array and filter out any invalid entries
  const validAvailableDates = Array.isArray(availableDates) 
    ? availableDates.filter(date => date && typeof date === 'string' && date.length > 0)
    : [];

  console.log("Valid available dates after filtering:", validAvailableDates);

  // Convert string dates to Date objects, ensuring proper parsing
  const availableDateObjects = validAvailableDates.map(dateStr => {
    console.log("Processing date string:", dateStr);
    try {
      // Handle YYYY-MM-DD format by creating a local date
      // This prevents timezone-related off-by-one-day errors
      const parts = dateStr.split('-').map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) {
        console.warn("Invalid date format:", dateStr);
        return null;
      }
      // Create date in local timezone to match calendar component expectations
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      console.log("Converted to date object:", dateObj);
      return dateObj;
    } catch (error) {
      console.error("Error parsing date:", dateStr, error);
      return null;
    }
  }).filter(date => date !== null) as Date[];

  console.log("Converted available date objects:", availableDateObjects);

  // Check if a date is available by comparing year, month, and day
  const isDateAvailable = (date: Date) => {
    const result = availableDateObjects.some(availableDate => 
      availableDate.getFullYear() === date.getFullYear() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getDate() === date.getDate()
    );
    return result;
  };

  // Disable dates that are not available or in the past
  const disabledDates = (date: Date) => {
    const today = new Date();
    // Compare dates at midnight to avoid timezone issues
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const isPast = date < todayMidnight;
    const isNotAvailable = !isDateAvailable(date);
    
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
    if (!selectedDate || !scheduleData.length) return null
    
    // Format selectedDate to YYYY-MM-DD to match scheduleData date format
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return scheduleData.find(schedule => schedule.scheduled_date === dateStr)
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

    // Get unique time combinations from schedule instances
    const uniqueTimes = scheduleData.reduce((acc: any[], schedule) => {
      const timeSlot = `${schedule.start_time} - ${schedule.end_time}`
      if (!acc.find(t => `${t.startTime} - ${t.endTime}` === timeSlot)) {
        acc.push({
          startTime: schedule.start_time,
          endTime: schedule.end_time
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
                {selectedSchedule.start_time} - {selectedSchedule.end_time}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Availability:</span>
              <span className="text-sm text-muted-foreground">
                {selectedSchedule.available_spots} of {selectedSchedule.capacity} spots available
              </span>
            </div>
            {selectedSchedule.price_override && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Price:</span>
                <span className="text-sm font-semibold">
                  ฿{selectedSchedule.price_override.toLocaleString()}
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
