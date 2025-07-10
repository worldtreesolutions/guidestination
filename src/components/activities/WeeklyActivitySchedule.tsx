import { useDroppable, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { X, Clock, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScheduledActivity } from "./ExcursionPlanner"
import { useLanguage } from "@/contexts/LanguageContext"
import { useMemo, useCallback, useState } from "react"

interface ScheduledActivity {
  id: number;
  title: string;
  day?: string;
  hour?: number;
  imageUrl?: string;
  participants?: number;
}

interface WeeklyActivityScheduleProps {
  scheduledActivities: ScheduledActivity[]
  onActivityDrop: (activityId: number, day: string, hour: number) => void
  onActivityClick: (activity: ScheduledActivity) => void
}

const HOUR_HEIGHT = 100

// Completely separate component for the remove button
const RemoveButton = ({ 
  activityId, 
  onRemove 
}: { 
  activityId: string
  onRemove: (id: string) => void 
}) => {
  // Use a separate handler for the remove button
  const handleClick = (e: React.MouseEvent) => {
    // Prevent any event propagation
    e.preventDefault()
    e.stopPropagation()
    
    // Call the remove function directly
    onRemove(activityId)
  }
  
  return (
    <button
      className="absolute top-2 right-2 z-[200] rounded-full bg-red-500 hover:bg-red-600 p-1.5 cursor-pointer shadow-md transition-transform duration-150 hover:scale-110"
      onClick={handleClick}
      type="button"
      aria-label="Remove activity"
      // Prevent any dragging on this element
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
    data: activity
  })

  const style = transform ? {
    transform: CSS.Translate.toString(transform)
  } : undefined

  if (isDragging) {
    return <div ref={setNodeRef} style={{ height: `${HOUR_HEIGHT}px`, opacity: 0 }} />
  }

  return (
    <div className="relative h-full">
      {/* The draggable card */}
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
            src={activity.imageUrl}
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
                  {activity.hour}:00 - {activity.hour + activity.duration}:00
                </div>
                <div className="text-xs bg-primary/80 rounded-full px-2 py-1 inline-flex items-center gap-1 w-fit">
                  <MapPin className="h-3 w-3" />
                  ฿{activity.price.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Completely separate remove button */}
      <RemoveButton activityId={activity.id} onRemove={onRemove} />
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
    data: { day, hour },
    disabled: !isAvailable
  })

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

export const WeeklyActivitySchedule = ({
  scheduledActivities,
  onActivityDrop,
  onActivityClick
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
  
  // Memoize dayKeys to prevent it from changing on every render
  const dayKeys = useMemo(() => [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ], [])
  
  // Memoize hours to prevent it from changing on every render
  const hours = useMemo(() => Array.from({ length: 9 }, (_, i) => i + 9), [])

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`
  }

  // Direct removal handler that bypasses any drag operations
  const handleActivityRemove = useCallback((activityId: string) => {
    // Call the parent component's removal function directly
    onActivityRemove(activityId)
  }, [onActivityRemove])

  // Organize activities by day and starting hour
  const activitiesByDayAndHour = useMemo(() => {
    const result: Record<string, Record<number, ScheduledActivity>> = {}
    
    dayKeys.forEach(day => {
      result[day] = {}
    })
    
    scheduledActivities.forEach(activity => {
      if (!result[activity.day]) {
        result[activity.day] = {}
      }
      result[activity.day][activity.hour] = activity
    })
    
    return result
  }, [scheduledActivities, dayKeys])

  // Track which cells should be skipped because they're covered by a rowspan
  const skipCells = useMemo(() => {
    const result: Record<string, Record<number, boolean>> = {}
    
    dayKeys.forEach(day => {
      result[day] = {}
      
      // Initialize all hours as not skipped
      hours.forEach(hour => {
        result[day][hour] = false
      })
      
      // Mark cells that should be skipped due to rowspan
      scheduledActivities.forEach(activity => {
        if (activity.day === day) {
          // Skip cells after the first hour of the activity
          for (let i = 1; i < activity.duration; i++) {
            const hourToSkip = activity.hour + i
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

    // Check if this slot is part of an existing activity
    return !scheduledActivities.some(
      activity => 
        activity.day === day && 
        hour >= activity.hour && 
        hour < activity.hour + activity.duration
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg shadow-md border border-gray-200">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-primary/10">
            <th className="p-3 border-b border-r border-gray-200 w-20 text-gray-800">
              <div className="flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="font-bold">{t("calendar.time")}</span>
              </div>
            </th>
            {days.map((day, index) => (
              <th key={day} className="p-3 border-b border-r border-gray-200 text-center font-medium w-[14.28%] text-gray-800">
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
              <td className="p-2 border-r border-b border-gray-200 font-medium text-center">
                <div className="flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                  <span className="text-sm">{formatHour(hour)}</span>
                </div>
              </td>
              {dayKeys.map(day => {
                // Skip rendering this cell if it's covered by a rowspan
                if (skipCells[day][hour]) {
                  return null
                }
                
                const activity = activitiesByDayAndHour[day][hour]
                const isAvailable = activity ? true : isSlotAvailable(day, hour)
                
                // If this is the first hour of an activity, render it with rowspan
                if (activity) {
                  return (
                    <td 
                      key={`${day}-${hour}`}
                      className="p-1 border-r border-b border-gray-200 relative bg-primary/5"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      rowSpan={activity.duration}
                    >
                      <ActivityCard 
                        activity={activity} 
                        onRemove={handleActivityRemove} 
                      />
                    </td>
                  )
                }
                
                // Otherwise render a droppable cell
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
