
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useState } from "react"
import { ScheduledActivity } from "./ExcursionPlanner"

interface WeeklyActivityScheduleProps {
  selectedActivities: ScheduledActivity[]
  onActivitySelect: (activity: ScheduledActivity) => void
}

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const hours = Array.from({ length: 24 }, (_, i) => i)

export const WeeklyActivitySchedule = ({
  selectedActivities,
  onActivitySelect
}: WeeklyActivityScheduleProps) => {
  const [draggedActivity, setDraggedActivity] = useState<ScheduledActivity | null>(null)
  const sensors = useSensors(useSensor(PointerSensor))

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`
  }

  const getActivityForSlot = (day: string, hour: number) => {
    return selectedActivities.find(
      activity => activity.day === day && 
      hour >= activity.hour && 
      hour < activity.hour + activity.duration
    )
  }

  const isSlotAvailable = (day: string, hour: number) => {
    // Mock unavailable slots - replace with actual API data
    const unavailableSlots = {
      monday: [13, 14, 15], // 13:00-16:00 unavailable
      wednesday: [9, 10, 11], // 9:00-12:00 unavailable
    }
    return !(unavailableSlots[day as keyof typeof unavailableSlots]?.includes(hour))
  }

  const handleDragStart = (event: DragEndEvent) => {
    const activity = selectedActivities.find(a => a.id === event.active.id)
    if (activity) {
      setDraggedActivity(activity)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedActivity(null)
    if (!event.over) return

    const [day, hour] = event.over.id.toString().split("-")
    const hourNum = parseInt(hour)
    
    if (!isSlotAvailable(day, hourNum)) return

    const activity = selectedActivities.find(a => a.id === event.active.id)
    if (activity) {
      onActivitySelect({
        ...activity,
        day,
        hour: hourNum
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border bg-muted"></th>
              {hours.map(hour => (
                <th key={hour} className="p-2 border text-center min-w-[100px] bg-muted">
                  {formatHour(hour)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day}>
                <td className="p-2 border font-medium capitalize bg-muted">
                  {day}
                </td>
                {hours.map(hour => {
                  const activity = getActivityForSlot(day, hour)
                  const isAvailable = isSlotAvailable(day, hour)
                  const isFirstHourOfActivity = activity?.hour === hour

                  return (
                    <td 
                      key={`${day}-${hour}`} 
                      className={`p-1 border relative min-h-[80px] ${!isAvailable ? "bg-gray-100" : ""}`}
                      style={{
                        opacity: activity && !isFirstHourOfActivity ? 0 : 1,
                      }}
                    >
                      {activity && isFirstHourOfActivity ? (
                        <div 
                          className="relative h-20 group cursor-move"
                          style={{
                            width: `${activity.duration * 100}%`,
                            position: "absolute",
                            zIndex: 10
                          }}
                        >
                          <Image
                            src={activity.imageUrl}
                            alt={activity.title}
                            fill
                            className="object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <div className="p-2 text-white text-xs">
                              <div className="font-medium">{activity.title}</div>
                              <div>{activity.duration}h</div>
                            </div>
                          </div>
                        </div>
                      ) : !isAvailable ? (
                        <div className="h-20 bg-gray-200 rounded-md flex items-center justify-center text-sm text-gray-500">
                          Indisponible
                        </div>
                      ) : (
                        <div className="h-20 border-2 border-dashed border-gray-200 rounded-md"></div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DragOverlay>
        {draggedActivity && (
          <div className="relative h-20 w-40 opacity-50">
            <Image
              src={draggedActivity.imageUrl}
              alt={draggedActivity.title}
              fill
              className="object-cover rounded-md"
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
