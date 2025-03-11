
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimeSlot {
  startTime: string
  endTime: string
  maxParticipants: number
}

interface DaySchedule {
  isActive: boolean
  timeSlots: TimeSlot[]
}

type WeekSchedule = {
  [key in "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"]: DaySchedule
}

interface WeeklyScheduleManagerProps {
  onSave: (schedule: WeekSchedule) => void
}

const defaultTimeSlot: TimeSlot = {
  startTime: "09:00",
  endTime: "10:00",
  maxParticipants: 10
}

const dayNames = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday"
}

export const WeeklyScheduleManager = ({ onSave }: WeeklyScheduleManagerProps) => {
  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: { isActive: true, timeSlots: [defaultTimeSlot] },
    tuesday: { isActive: true, timeSlots: [defaultTimeSlot] },
    wednesday: { isActive: true, timeSlots: [defaultTimeSlot] },
    thursday: { isActive: true, timeSlots: [defaultTimeSlot] },
    friday: { isActive: true, timeSlots: [defaultTimeSlot] },
    saturday: { isActive: true, timeSlots: [defaultTimeSlot] },
    sunday: { isActive: true, timeSlots: [defaultTimeSlot] }
  })

  const [isScheduleActive, setIsScheduleActive] = useState(true)

  const toggleDay = (day: keyof WeekSchedule) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isActive: !prev[day].isActive
      }
    }))
  }

  const addTimeSlot = (day: keyof WeekSchedule) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...prev[day].timeSlots, defaultTimeSlot]
      }
    }))
  }

  const updateTimeSlot = (
    day: keyof WeekSchedule,
    index: number,
    field: keyof TimeSlot,
    value: string | number
  ) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }))
  }

  const removeTimeSlot = (day: keyof WeekSchedule, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter((_, i) => i !== index)
      }
    }))
  }

  const handleSave = () => {
    onSave(schedule)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {isScheduleActive ? "Active" : "Paused"}
            </span>
            <Switch
              checked={isScheduleActive}
              onCheckedChange={setIsScheduleActive}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {(Object.keys(dayNames) as Array<keyof WeekSchedule>).map(day => (
          <div key={day} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{dayNames[day]}</h3>
              <Switch
                checked={schedule[day].isActive}
                onCheckedChange={() => toggleDay(day)}
              />
            </div>

            {schedule[day].isActive && (
              <div className="space-y-4 pl-4">
                {schedule[day].timeSlots.map((slot, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateTimeSlot(day, index, "startTime", e.target.value)}
                      />
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateTimeSlot(day, index, "endTime", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Max participants"
                        value={slot.maxParticipants}
                        onChange={(e) => updateTimeSlot(day, index, "maxParticipants", parseInt(e.target.value))}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeTimeSlot(day, index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addTimeSlot(day)}
                  className="w-full"
                >
                  Add Time Slot
                </Button>
              </div>
            )}
          </div>
        ))}

        <Button onClick={handleSave} className="w-full">
          Save Schedule
        </Button>
      </CardContent>
    </Card>
  )
}
