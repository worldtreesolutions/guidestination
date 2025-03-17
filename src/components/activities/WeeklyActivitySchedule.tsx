
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, useDroppable } from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { useState } from "react"
import { ScheduledActivity } from "./ExcursionPlanner"

interface WeeklyActivityScheduleProps {
  scheduledActivities: ScheduledActivity[]
  onActivitySelect: (activity: ScheduledActivity) => void
}

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const hours = Array.from({ length: 9 }, (_, i) => i + 9)

const ActivityCard = ({ activity }: { activity: ScheduledActivity }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: activity.id,
    data: activity
  })

  const gridRowSpan = activity.duration;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: `${gridRowSpan * 100}%`,
    zIndex: 10
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move"
    >
      <div className="absolute inset-0 rounded-lg overflow-hidden border-2 border-primary bg-white">
        <Image
          src={activity.imageUrl}
          alt={activity.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50">
          <div className="p-3 text-white">
            <div className="font-medium text-sm">{activity.title}</div>
            <div className="text-xs mt-1">{activity.duration}h</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const TimeSlot = ({ 
  day, 
  hour, 
  activity,
  isAvailable,
  isFirstHourOfActivity 
}: { 
  day: string
  hour: number
  activity: ScheduledActivity | null
  isAvailable: boolean
  isFirstHourOfActivity: boolean
}) => {
  const { setNodeRef } = useDroppable({
    id: `${day}-${hour}`
  })

  if (!isAvailable) {
    return (
      <td className="p-1 border relative h-24 bg-gray-100">
        <div className="h-full bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500">
          Indisponible
        </div>
      </td>
    )
  }

  return (
    <td 
      ref={setNodeRef}
      className={`p-1 border relative h-24 ${activity ? "bg-primary/5" : "hover:bg-gray-50"}`}
      style={{
        position: "relative"
      }}
    >
      {activity && isFirstHourOfActivity ? (
        <ActivityCard activity={activity} />
      ) : (
        <div className="h-full border-2 border-dashed border-gray-200 rounded-lg"></div>
      )}
    </td>
  )
}

export const WeeklyActivitySchedule = ({
  scheduledActivities,
  onActivitySelect
}: WeeklyActivityScheduleProps) => {
  const [draggedActivity, setDraggedActivity] = useState<ScheduledActivity | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }))

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`
  }

  const getActivityForSlot = (day: string, hour: number) => {
    return scheduledActivities.find(
      activity => activity.day === day && 
      hour >= activity.hour && 
      hour < activity.hour + activity.duration
    )
  }

  const isSlotAvailable = (day: string, hour: number, activityDuration: number = 1) => {
    const unavailableSlots = {
      monday: [13, 14, 15],
      wednesday: [9, 10, 11],
      friday: [16, 17, 18],
    }

    if (hour + activityDuration > 18) {
      return false
    }

    for (let i = 0; i < activityDuration; i++) {
      if (unavailableSlots[day as keyof typeof unavailableSlots]?.includes(hour + i)) {
        return false
      }
    }

    const conflictingActivity = scheduledActivities.find(activity => {
      if (activity.day !== day) return false
      if (activity.id === draggedActivity?.id) return false
      
      const activityEnd = activity.hour + activity.duration
      const newActivityEnd = hour + activityDuration
      
      return !(hour >= activityEnd || activity.hour >= newActivityEnd)
    })

    return !conflictingActivity
  }

  const handleDragStart = (event: DragStartEvent) => {
    const activity = scheduledActivities.find(a => a.id === event.active.id)
    if (activity) {
      setDraggedActivity(activity)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedActivity(null)
    if (!event.over) return

    const [day, hour] = event.over.id.toString().split("-")
    const hourNum = parseInt(hour)
    
    const activity = scheduledActivities.find(a => a.id === event.active.id)
    if (activity && isSlotAvailable(day, hourNum, activity.duration)) {
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
      <div className="w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 border w-20"></th>
              {days.map((day) => (
                <th key={day} className="p-2 border text-center font-medium w-[14.28%]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td className="p-2 border font-medium bg-muted text-center">
                  {formatHour(hour)}
                </td>
                {dayKeys.map(day => {
                  const activity = getActivityForSlot(day, hour)
                  const isAvailable = activity ? true : isSlotAvailable(day, hour)
                  const isFirstHourOfActivity = activity?.hour === hour

                  return (
                    <TimeSlot
                      key={`${day}-${hour}`}
                      day={day}
                      hour={hour}
                      activity={activity || null}
                      isAvailable={isAvailable}
                      isFirstHourOfActivity={isFirstHourOfActivity}
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DragOverlay>
        {draggedActivity && (
          <div className='relative h-[200px] w-[150px] rounded-lg overflow-hidden border-2 border-primary bg-white shadow-lg'>
            <Image
              src={draggedActivity.imageUrl}
              alt={draggedActivity.title}
              fill
              className='object-cover'
            />
            <div className='absolute inset-0 bg-black/50'>
              <div className='p-3 text-white'>
                <div className='font-medium text-sm'>{draggedActivity.title}</div>
                <div className='text-xs mt-1'>{draggedActivity.duration}h</div>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
