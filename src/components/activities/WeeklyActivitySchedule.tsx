import { useDroppable, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScheduledActivity } from "./ExcursionPlanner"

interface WeeklyActivityScheduleProps {
  scheduledActivities: ScheduledActivity[]
  draggedActivity: ScheduledActivity | null
  onActivitySelect: (activityId: string, updatedActivity: ScheduledActivity) => void
  onActivityRemove: (activityId: string) => void
}

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const hours = Array.from({ length: 9 }, (_, i) => i + 9)

const HOUR_HEIGHT = 100

const ActivityCard = ({ activity, onRemove }: { activity: ScheduledActivity; onRemove: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: activity.id,
    data: activity
  })

  const style = transform ? {
    transform: CSS.Translate.toString(transform)
  } : undefined

  const height = activity.duration * HOUR_HEIGHT - 8

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        height: `${height}px`,
        position: 'absolute',
        inset: '4px',
        zIndex: 10
      }}
      className='cursor-move touch-none group transition-all duration-150'
      {...listeners}
      {...attributes}
    >
      <div className='absolute inset-0 rounded-lg overflow-hidden border-2 border-primary bg-white shadow-lg'>
        <div className='absolute inset-0'>
          <Image
            src={activity.imageUrl}
            alt={activity.title}
            fill
            className='object-cover'
          />
          <div className='absolute inset-0 bg-black/50'>
            <div className='p-3 text-white'>
              <div className='font-medium text-sm line-clamp-2'>{activity.title}</div>
              <div className='text-xs mt-1 bg-black/30 rounded px-2 py-1 inline-block'>
                {activity.hour}:00 - {activity.hour + activity.duration}:00
              </div>
            </div>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 hover:bg-red-500/40'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove(activity.id)
            }}
          >
            <X className='h-4 w-4 text-white' />
          </Button>
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
  isFirstHourOfActivity,
  isPartOfActivity,
  showUnavailable,
  onActivityRemove
}: { 
  day: string
  hour: number
  activity: ScheduledActivity | null
  isAvailable: boolean
  isFirstHourOfActivity: boolean
  isPartOfActivity: boolean
  showUnavailable: boolean
  onActivityRemove: (id: string) => void
}) => {
  const { setNodeRef } = useDroppable({
    id: `${day}-${hour}`,
    data: { day, hour },
    disabled: !isAvailable
  })

  if (!isAvailable && !activity && showUnavailable) {
    return (
      <td className="p-1 border relative bg-gray-100" style={{ height: `${HOUR_HEIGHT}px` }}>
        <div className="h-full bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500">
          Indisponible
        </div>
      </td>
    )
  }

  return (
    <td 
      ref={setNodeRef}
      className={`p-1 border relative ${isPartOfActivity ? "bg-primary/5" : "hover:bg-gray-50"}`}
      style={{
        height: `${HOUR_HEIGHT}px`,
        position: "relative"
      }}
    >
      {isFirstHourOfActivity && activity ? (
        <ActivityCard activity={activity} onRemove={onActivityRemove} />
      ) : !isPartOfActivity && (
        <div className="h-full border-2 border-dashed border-gray-200 rounded-lg"></div>
      )}
    </td>
  )
}

export const WeeklyActivitySchedule = ({
  scheduledActivities,
  draggedActivity,
  onActivitySelect,
  onActivityRemove
}: WeeklyActivityScheduleProps) => {
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

  const isSlotPartOfActivity = (day: string, hour: number) => {
    return scheduledActivities.some(
      activity => 
        activity.day === day && 
        hour >= activity.hour && 
        hour < activity.hour + activity.duration
    )
  }

  const isSlotAvailable = (day: string, hour: number) => {
    if (hour > 17) return false

    if (draggedActivity) {
      // Check if there's enough continuous slots for the activity duration
      for (let i = 0; i < draggedActivity.duration; i++) {
        const currentHour = hour + i
        if (currentHour > 17) return false
        
        const existingActivity = scheduledActivities.find(activity => {
          if (activity.day !== day || activity.id === draggedActivity.id) return false
          const activityEnd = activity.hour + activity.duration
          return currentHour >= activity.hour && currentHour < activityEnd
        })
        
        if (existingActivity) return false
      }

      const providerUnavailability = {
        monday: [13, 14, 15],
        wednesday: [9, 10, 11],
        friday: [16, 17, 18],
      }

      // Check if any hour in the activity duration is in provider unavailability
      for (let i = 0; i < draggedActivity.duration; i++) {
        const currentHour = hour + i
        if (providerUnavailability[day as keyof typeof providerUnavailability]?.includes(currentHour)) {
          return false
        }
      }

      return true
    }

    return !isSlotPartOfActivity(day, hour)
  }

  return (
    <div className="w-full overflow-x-auto">
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
                const isPartOfActivity = isSlotPartOfActivity(day, hour)
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
                    isPartOfActivity={isPartOfActivity}
                    showUnavailable={!!draggedActivity}
                    onActivityRemove={onActivityRemove}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}