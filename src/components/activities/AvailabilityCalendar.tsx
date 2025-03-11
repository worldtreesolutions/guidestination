
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface TimeSlot {
  startTime: string
  endTime: string
  maxParticipants: number
}

interface AvailabilityCalendarProps {
  onSave: (availability: {
    date: Date
    timeSlots: TimeSlot[]
  }) => void
}

export const AvailabilityCalendar = ({ onSave }: AvailabilityCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, {
      startTime: "09:00",
      endTime: "10:00",
      maxParticipants: 10
    }])
  }

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string | number) => {
    const newTimeSlots = [...timeSlots]
    newTimeSlots[index] = {
      ...newTimeSlots[index],
      [field]: value
    }
    setTimeSlots(newTimeSlots)
  }

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (selectedDate) {
      onSave({
        date: selectedDate,
        timeSlots
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Activity Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div className="space-y-4">
              {timeSlots.map((slot, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateTimeSlot(index, "startTime", e.target.value)}
                    />
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateTimeSlot(index, "endTime", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max participants"
                      value={slot.maxParticipants}
                      onChange={(e) => updateTimeSlot(index, "maxParticipants", parseInt(e.target.value))}
                      className="col-span-2"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeTimeSlot(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={addTimeSlot} className="w-full">
              Add Time Slot
            </Button>
            <Button 
              onClick={handleSave} 
              className="w-full"
              disabled={!selectedDate || timeSlots.length === 0}
            >
              Save Availability
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
