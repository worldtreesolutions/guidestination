
import { useDroppable, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { X, Clock, Calendar, MapPin } from "lucide-react"
import { ScheduledActivity } from "@/types/activity"
import { useLanguage } from "@/contexts/LanguageContext"
import { useMemo, useCallback } from "react"

interface WeeklyActivityScheduleProps {
  scheduledActivities: ScheduledActivity[]
  draggedActivity: ScheduledActivity | null
  onActivityClick: (activity: ScheduledActivity) => void
  onActivityRemove: (id: string) => void
}

const HOUR_HEIGHT = 100

const RemoveButton = ({ 
  activityId, 
  onRemove 
}: { 
  activityId: string
  onRemove: (id: string) => void 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove(activityId)
  }
  
  return (
    <button
      className="absolute top-2 right-2 z-[200] rounded-full bg-red-500 hover:bg-red-600 p-1.5 cursor-pointer shadow-md transition-transform duration-150 hover:scale-110"
      onClick={handleClick}
      type="button"
      aria-label="Remove activity"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <X className="h-3.5 w-3.5 text-white" />
    </button>
  )
}

const ActivityCard = ({ activity, onRemove }: { activity: ScheduledActivity; onRemove: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
     { activity }
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform)
  } : undefined

  const durationNum = useMemo(() => parseInt(String(activity.duration) || '1', 10), [activity.duration]);
  const activityHour = useMemo(() => activity.hour ? parseInt(activity.hour, 10) : 0, [activity.hour]);
  const endTime = activityHour + durationNum;

  if (isDragging) {
    return <div ref={setNodeRef} style={{ height: `${HOUR_HEIGHT}px`, opacity: 0 }} />
  }

  return (
    <div className="relative h-full">
      <div
        ref={setNodeRef}
        style={{
          ...style,
          height: "100%",
          position: "relative"
        }}
        className="cursor-move touch-none group transition-all duration-150 h-full"
        {...listeners}
        {...attributes}
      >
        <div className="absolute inset-0 m-1 rounded-lg overflow-hidden border-2 border-primary bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:border-primary/80">
          <Image
            src={activity.image_url || "/placeholder.jpg"}
            alt={activity.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30">
            <div className="p-3 text-white h-full flex flex-col justify-between">
              <div className="font-medium text-sm line-clamp-2">{activity.title}</div>
              <div className="flex flex-col gap-1 mt-1">
                <div className="text-xs bg-primary/80 rounded-full px-2 py-1 inline-flex items-center gap-1 w-fit">
                  <Clock className="h-3 w-3" />
                  {activityHour}:00 - {endTime}:00
                </div>
                <div className="text-xs bg-primary/80 rounded-full px-2 py-1 inline-flex items-center gap-1 w-fit">
                  <MapPin className="h-3 w-3" />
                  ฿{(activity.price || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <RemoveButton activityId={String(activity.id)} onRemove={onRemove} />
    </div>
  )
}

const DroppableCell = ({ 
  day, 
  hour, 
  isAvailable,
  showUnavailable,
  children
}: { 
  day: string
  hour: number
  isAvailable: boolean
  showUnavailable: boolean
  children: React.ReactNode
}) => {
  const { t } = useLanguage()
  const { setNodeRef } = useDroppable({
    id: `${day}-${hour}`,
     { day, hour },
    disabled: !isAvailable
  });

  if (!isAvailable && showUnavailable) {
    return (
      <td 
        className="p-1 border border-gray-200 relative bg-gray-50" 
        style={{ height: `${HOUR_HEIGHT}px` }}
      >
        <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500 border border-dashed border-gray-300">
          <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">{t("calendar.unavailable")}</span>
        </div>
      </td>
    )
  }

  return (
    <td 
      ref={setNodeRef}
      className={`p-1 border border-gray-200 relative ${isAvailable ? 'hover:bg-primary/5 transition-colors duration-200' : 'bg-primary/5'}`}
      style={{ height: `${HOUR_HEIGHT}px` }}
    >
      {children}
    </td>
  )
}

const renderHourCell = (hour: number) => {
    const formatHour = (h: number) => `${h.toString().padStart(2, "0")}:00`;
    return (
        <td className="p-2 border-r border-b border-gray-200 font-medium text-center align-middle">
            <div className="flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                <span className="text-sm">{formatHour(hour)}</span>
            </div>
        </td>
    );
};

export const WeeklyActivitySchedule = ({
  scheduledActivities,
  draggedActivity,
  onActivityClick,
  onActivityRemove
}: WeeklyActivityScheduleProps) => {
  const { t } = useLanguage()
  
  const days = useMemo(() => [
    t("calendar.monday"),
    t("calendar.tuesday"), 
    t("calendar.wednesday"),
    t("calendar.thursday"),
    t("calendar.friday"),
    t("calendar.saturday"),
    t("calendar.sunday")
  ], [t])
  
  const dayKeys = useMemo(() => [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ], [])
  
  const hours = useMemo(() => Array.from({ length: 9 }, (_, i) => i + 9), [])

  const handleActivityRemove = useCallback((activityId: string) => {
    onActivityRemove(activityId)
  }, [onActivityRemove])

  const activitiesByDayAndHour = useMemo(() => {
    const result: { [key: string]: { [key: number]: ScheduledActivity } } = {}
    dayKeys.forEach(day => {
      result[day] = {}
    })
    scheduledActivities.forEach(activity => {
      const activityHour = activity.hour ? parseInt(activity.hour, 10) : -1;
      if (activity.day && activityHour !== -1 && !isNaN(activityHour)) {
        if (!result[activity.day]) {
          result[activity.day] = {}
        }
        result[activity.day][activityHour] = activity
      }
    })
    return result
  }, [scheduledActivities, dayKeys])

  const skipCells = useMemo(() => {
    const result: { [key: string]: { [key: number]: boolean } } = {}
    dayKeys.forEach(day => {
      result[day] = {}
      hours.forEach(hour => {
        result[day][hour] = false
      })
      scheduledActivities.forEach(activity => {
        const durationNum = parseInt(String(activity.duration) || '1', 10);
        const activityHour = activity.hour ? parseInt(activity.hour, 10) : -1;
        if (activity.day === day && activityHour !== -1 && !isNaN(activityHour) && durationNum) {
          for (let i = 1; i < durationNum; i++) {
            const hourToSkip = activityHour + i
            if (hourToSkip <= 17) {
              result[day][hourToSkip] = true
            }
          }
        }
      })
    })
    return result
  }, [scheduledActivities, dayKeys, hours])

  const isSlotAvailable = (day: string, hour: number) => {
    if (hour > 17) return false

    if (draggedActivity) {
      const draggedDuration = parseInt(String(draggedActivity.duration) || '1', 10);
      if (!draggedDuration) return false;
      for (let i = 0; i < draggedDuration; i++) {
        const currentHour = hour + i
        if (currentHour > 17) return false
        
        const existingActivity = scheduledActivities.find(activity => {
          const activityDuration = parseInt(String(activity.duration) || '1', 10);
          const activityHour = activity.hour ? parseInt(activity.hour, 10) : -1;
          if (activity.day !== day || activity.id === draggedActivity.id || activityHour === -1 || !activityDuration) return false
          const activityEnd = activityHour + activityDuration
          const hasOverlap = currentHour >= activityHour && currentHour < activityEnd
          return hasOverlap
        })
        
        if (existingActivity) return false
      }
      return true
    }

    return !scheduledActivities.some(
      activity => {
        const activityDuration = parseInt(String(activity.duration) || '1', 10);
        const activityHour = activity.hour ? parseInt(activity.hour, 10) : -1;
        return activity.day === day && 
        activityHour !== -1 &&
        activityDuration &&
        hour >= activityHour && 
        hour < activityHour + activityDuration
      }
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg shadow-md border border-gray-200">
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr className="bg-primary/10">
            <th className="p-3 border-b border-r border-gray-200 w-28 text-gray-800">
              <div className="flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="font-bold">{t("calendar.time")}</span>
              </div>
            </th>
            {days.map((day, index) => (
              <th key={day} className="p-3 border-b border-r border-gray-200 text-center font-medium text-gray-800">
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold">{day}</span>
                  <span className="text-xs text-gray-600">{t("calendar.day")} {index + 1}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map(hour => (
            <tr key={hour} className={hour % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {renderHourCell(hour)}
              {dayKeys.map(day => {
                if (skipCells[day]?.[hour]) {
                  return null
                }
                
                const activity = activitiesByDayAndHour[day]?.[hour]
                const isAvailable = activity ? false : isSlotAvailable(day, hour)
                const durationNum = activity ? parseInt(String(activity.duration) || '1', 10) : 1;
                
                if (activity) {
                  return (
                    <td
                      key={activity.id}
                      className="p-1 border-r border-b border-gray-200 relative bg-primary/5 align-top"
                      rowSpan={durationNum}
                    >
                      <div style={{ height: `${HOUR_HEIGHT * durationNum}px` }}>
                        <ActivityCard 
                          activity={activity} 
                          onRemove={handleActivityRemove} 
                        />
                      </div>
                    </td>
                  )
                }
                
                return (
                  <DroppableCell
                    key={`${day}-${hour}`}
                    day={day}
                    hour={hour}
                    isAvailable={isAvailable}
                    showUnavailable={!!draggedActivity}
                  >
                    <div className="h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                      {isAvailable && !draggedActivity && (
                        <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {t("calendar.dropHere")}
                        </div>
                      )}
                    </div>
                  </DroppableCell>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
