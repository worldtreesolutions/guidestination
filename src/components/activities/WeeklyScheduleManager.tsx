import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface DaySchedule {
  isActive: boolean
  hours: boolean[]  // 24 slots pour chaque heure de la journée
}

type WeekSchedule = {
  [key in "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"]: DaySchedule
}

interface WeeklyScheduleManagerProps {
  onSave: (schedule: WeekSchedule) => void
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
    monday: { isActive: true, hours: new Array(24).fill(false) },
    tuesday: { isActive: true, hours: new Array(24).fill(false) },
    wednesday: { isActive: true, hours: new Array(24).fill(false) },
    thursday: { isActive: true, hours: new Array(24).fill(false) },
    friday: { isActive: true, hours: new Array(24).fill(false) },
    saturday: { isActive: true, hours: new Array(24).fill(false) },
    sunday: { isActive: true, hours: new Array(24).fill(false) }
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

  const toggleHour = (day: keyof WeekSchedule, hour: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        hours: prev[day].hours.map((value, index) => 
          index === hour ? !value : value
        )
      }
    }))
  }

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  const handleSave = () => {
    onSave(schedule)
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Weekly Schedule</CardTitle>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>
              {isScheduleActive ? 'Active' : 'Paused'}
            </span>
            <Switch
              checked={isScheduleActive}
              onCheckedChange={setIsScheduleActive}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr>
                <th className='p-2 border'></th>
                {Array.from({ length: 24 }, (_, i) => (
                  <th key={i} className='p-2 border text-center min-w-[60px]'>
                    {formatHour(i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(dayNames) as Array<keyof WeekSchedule>).map(day => (
                <tr key={day}>
                  <td className='p-2 border'>
                    <div className='flex items-center justify-between gap-2'>
                      <span>{dayNames[day]}</span>
                      <Switch
                        checked={schedule[day].isActive}
                        onCheckedChange={() => toggleDay(day)}
                        className='ml-2'
                      />
                    </div>
                  </td>
                  {schedule[day].hours.map((isActive, hour) => (
                    <td key={hour} className='p-1 border text-center'>
                      <Button
                        variant={isActive ? 'default' : 'outline'}
                        size='sm'
                        className='w-full h-8'
                        disabled={!schedule[day].isActive}
                        onClick={() => toggleHour(day, hour)}
                      >
                        {isActive ? '✓' : ''}
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button onClick={handleSave} className='w-full mt-6'>
          Save Schedule
        </Button>
      </CardContent>
    </Card>
  )
}