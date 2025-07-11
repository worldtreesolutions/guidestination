
import { useState, useCallback, useMemo } from "react"
import { useDroppable, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { X, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScheduledActivity } from "@/types/activity"
import { useLanguage } from "@/contexts/LanguageContext"

interface MobileWeeklyActivityScheduleProps {
  scheduledActivities: ScheduledActivity[]
  draggedActivity: ScheduledActivity | null
  onActivityClick: (activity: ScheduledActivity) => void
  onActivityRemove: (id: string) => void
}

const HOUR_HEIGHT = 80

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
      <div 
        className="p-1 border border-gray-200 relative bg-gray-50 rounded-lg" 
        style={{ height: `${HOUR_HEIGHT}px` }}
      >
        <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
          <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">{t("calendar.unavailable")}</span>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={setNodeRef}
      className={`p-1 border border-gray-200 relative rounded-lg ${isAvailable ? 'hover:bg-primary/5 transition-colors duration-200' : 'bg-primary/5'}`}
      style={{ height: `${HOUR_HEIGHT}px` }}
    >
      {children}
    </div>
  )
}

export const MobileWeeklyActivitySchedule = ({
  scheduledActivities,
  draggedActivity,
  onActivityClick,
  onActivityRemove
}: MobileWeeklyActivityScheduleProps) => {
  const { t } = useLanguage()
  const [activeDay, setActiveDay] = useState("monday")
  
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
  
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`
  }

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

  const activeDayIndex = dayKeys.indexOf(activeDay)
  
  const goToPreviousDay = () => {
    const newIndex = (activeDayIndex - 1 + dayKeys.length) % dayKeys.length
    setActiveDay(dayKeys[newIndex])
  }
  
  const goToNextDay = () => {
    const newIndex = (activeDayIndex + 1) % dayKeys.length
    setActiveDay(dayKeys[newIndex])
  }

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-4 bg-primary/10 rounded-lg p-2'>
        <Button 
          variant='ghost' 
          size='icon' 
          onClick={goToPreviousDay}
          className='h-8 w-8'
          aria-label={t("calendar.previousDay")}
        >
          <ChevronLeft className='h-5 w-5' />
        </Button>
        
        <div className='text-center'>
          <h3 className='font-bold text-primary'>{days[activeDayIndex]}</h3>
          <p className='text-xs text-muted-foreground'>{t("calendar.day")} {activeDayIndex + 1}</p>
        </div>
        
        <Button 
          variant='ghost' 
          size='icon' 
          onClick={goToNextDay}
          className='h-8 w-8'
          aria-label={t("calendar.nextDay")}
        >
          <ChevronRight className='h-5 w-5' />
        </Button>
      </div>

      <div className='space-y-2'>
        {hours.map(hour => {
          if (skipCells[activeDay]?.[hour]) {
            return null;
          }
          const scheduled = activitiesByDayAndHour[activeDay]?.[hour];
          const durationNum = scheduled ? parseInt(String(scheduled.duration) || '1', 10) : 1;

          return (
            <div key={hour} className='flex items-stretch gap-2'>
              <div className='w-16 flex items-center justify-center bg-primary/5 rounded-lg'>
                <div className='flex flex-col items-center'>
                  <Clock className='h-3.5 w-3.5 text-primary' />
                  <span className='text-sm font-medium'>{formatHour(hour)}</span>
                </div>
              </div>
              
              {scheduled ? (
                <div 
                  className='flex-1 relative'
                  style={{ 
                    height: `${HOUR_HEIGHT * durationNum + (durationNum > 1 ? (durationNum - 1) * 8 : 0)}px`
                  }}
                >
                  <ActivityCard 
                    activity={scheduled} 
                    onRemove={handleActivityRemove} 
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <DroppableCell
                    day={activeDay}
                    hour={hour}
                    isAvailable={isSlotAvailable(activeDay, hour)}
                    showUnavailable={!!draggedActivity}
                  >
                    <div className='h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center'>
                      {isSlotAvailable(activeDay, hour) && !draggedActivity && (
                        <div className='text-xs text-gray-400'>
                          {t("calendar.dropHere")}
                        </div>
                      )}
                    </div>
                  </DroppableCell>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div className='mt-4 flex justify-center'>
        <div className='grid grid-cols-7 w-full gap-1 bg-gray-100 p-1 rounded-lg'>
          {dayKeys.map((day, index) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-2 py-2 text-xs font-medium rounded transition-colors ${
                activeDay === day 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {days[index].substring(0, 2)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
