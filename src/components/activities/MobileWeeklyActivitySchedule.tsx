
import { useState, useCallback, useMemo } from "react"
import { useDroppable, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { X, Clock, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScheduledActivity } from "./ExcursionPlanner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/LanguageContext"

interface MobileWeeklyActivityScheduleProps {
  scheduledActivities: ScheduledActivity[]
  draggedActivity: ScheduledActivity | null
  onActivitySelect: (activityId: string, updatedActivity: ScheduledActivity) => void
  onActivityRemove: (activityId: string) => void
}

const HOUR_HEIGHT = 80

// Completely separate component for the remove button
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
  onActivitySelect,
  onActivityRemove
}: MobileWeeklyActivityScheduleProps) => {
  const { t } = useLanguage()
  const [activeDay, setActiveDay] = useState("monday")
  
  const days = [
    t("calendar.monday"),
    t("calendar.tuesday"), 
    t("calendar.wednesday"),
    t("calendar.thursday"),
    t("calendar.friday"),
    t("calendar.saturday"),
    t("calendar.sunday")
  ]
  const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  const hours = Array.from({ length: 9 }, (_, i) => i + 9)
  
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`
  }

  const handleActivityRemove = useCallback((activityId: string) => {
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

    if (draggedActivity) {
      // Check if there's enough continuous slots for the activity duration
      for (let i = 0; i < draggedActivity.duration; i++) {
        const currentHour = hour + i
        if (currentHour > 17) return false
        
        const existingActivity = scheduledActivities.find(activity => {
          if (activity.day !== day || activity.id === draggedActivity.id) return false
          const activityEnd = activity.hour + activity.duration
          
          // Allow consecutive placement (end-to-start or start-to-end)
          const isConsecutive = currentHour === activityEnd || 
                               (currentHour + draggedActivity.duration) === activity.hour
          
          // Check for overlap
          const hasOverlap = currentHour >= activity.hour && currentHour < activityEnd
          
          return hasOverlap && !isConsecutive
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

    // Check if this slot is part of an existing activity
    return !scheduledActivities.some(
      activity => 
        activity.day === day && 
        hour >= activity.hour && 
        hour < activity.hour + activity.duration
    )
  }

  // Get the index of the current active day
  const activeDayIndex = dayKeys.indexOf(activeDay)
  
  // Navigate to the previous day
  const goToPreviousDay = () => {
    const newIndex = (activeDayIndex - 1 + dayKeys.length) % dayKeys.length
    setActiveDay(dayKeys[newIndex])
  }
  
  // Navigate to the next day
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
          // Skip rendering this cell if it's covered by a rowspan
          if (skipCells[activeDay][hour]) {
            return null
          }
          
          const activity = activitiesByDayAndHour[activeDay][hour]
          const isAvailable = activity ? true : isSlotAvailable(activeDay, hour)
          
          return (
            <div key={hour} className='flex items-stretch gap-2'>
              <div className='w-16 flex items-center justify-center bg-primary/5 rounded-lg'>
                <div className='flex flex-col items-center'>
                  <Clock className='h-3.5 w-3.5 text-primary' />
                  <span className='text-sm font-medium'>{formatHour(hour)}</span>
                </div>
              </div>
              
              {activity ? (
                <div 
                  className='flex-1 relative bg-primary/5 rounded-lg'
                  style={{ 
                    height: activity.duration > 1 
                      ? `${HOUR_HEIGHT * activity.duration + (activity.duration - 1) * 8}px` 
                      : `${HOUR_HEIGHT}px` 
                  }}
                >
                  <ActivityCard 
                    activity={activity} 
                    onRemove={handleActivityRemove} 
                  />
                </div>
              ) : (
                <DroppableCell
                  day={activeDay}
                  hour={hour}
                  isAvailable={isAvailable}
                  showUnavailable={!!draggedActivity}
                >
                  <div className='h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center'>
                    {isAvailable && !draggedActivity && (
                      <div className='text-xs text-gray-400'>
                        {t("calendar.dropHere")}
                      </div>
                    )}
                  </div>
                </DroppableCell>
              )}
            </div>
          )
        })}
      </div>
      
      <div className='mt-4 flex justify-center'>
        <TabsList className='grid grid-cols-7 w-full'>
          {dayKeys.map((day, index) => (
            <TabsTrigger 
              key={day} 
              value={day}
              onClick={() => setActiveDay(day)}
              className={activeDay === day ? 'bg-primary text-primary-foreground' : ''}
            >
              {days[index].substring(0, 2)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </div>
  )
}
