
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { X, Clock, MapPin } from "lucide-react"
import Image from "next/image"
import { ScheduledActivity } from "./ExcursionPlanner"
import { useDroppable, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useIsMobile } from "@/hooks/use-mobile"
import { Activity } from "@/types/activity"

interface ActivityItemProps {
  activity: ScheduledActivity
  onRemove: (id: string) => void
}

const ActivityItem = ({ activity, onRemove }: ActivityItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    data: activity
  })
  
  const isMobile = useIsMobile()

  const style = transform ? {
    transform: CSS.Translate.toString(transform)
  } : undefined

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove(activity.id)
  }

  if (isDragging) {
    return <div ref={setNodeRef} style={{ width: isMobile ? 120 : 150, height: isMobile ? 160 : 200, opacity: 0 }} />
  }

  return (
    <div 
      className="relative" 
      style={{ 
        width: isMobile ? 120 : 150, 
        height: isMobile ? 160 : 200,
        margin: isMobile ? "0 auto" : "0"
      }}
    >
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="absolute inset-0 rounded-lg overflow-hidden border-2 border-primary bg-white shadow-lg cursor-move touch-none group transition-all duration-150 hover:shadow-xl hover:border-primary/80"
      >
        <Image
          src={activity.imageUrl}
          alt={activity.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30">
          <div className="p-2 sm:p-3 text-white h-full flex flex-col justify-between">
            <div className="font-medium text-xs sm:text-sm line-clamp-2">{activity.title}</div>
            <div className="flex flex-col gap-1 mt-1">
              <div className="text-xs bg-primary/80 rounded-full px-2 py-1 inline-flex items-center gap-1 w-fit">
                <Clock className="h-3 w-3" />
                {activity.duration}h
              </div>
              <div className="text-xs bg-primary/80 rounded-full px-2 py-1 inline-flex items-center gap-1 w-fit">
                <MapPin className="h-3 w-3" />
                ฿{activity.price.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        className="absolute top-2 right-2 z-[200] rounded-full bg-red-500 hover:bg-red-600 p-1.5 cursor-pointer shadow-md transition-transform duration-150 hover:scale-110"
        onClick={handleRemove}
        type="button"
        aria-label="Supprimer l'activité"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <X className="h-3.5 w-3.5 text-white" />
      </button>
    </div>
  )
}

interface SelectedActivitiesListProps {
  activities: Activity[] | ScheduledActivity[]
  onActivityRemove: (activityId: string) => void
}

// Function to convert Activity to ScheduledActivity format
const convertToScheduledActivity = (activity: Activity): ScheduledActivity => {
  return {
    id: activity.activity_id?.toString() || "",
    title: activity.title,
    imageUrl: typeof activity.image_url === 'string' ? activity.image_url : "",
    day: "",
    hour: 0,
    duration: 2, // Default duration
    price: activity.final_price || activity.b_price || 0,
    participants: 1 // Default participants
  }
}

// Function to check if an activity is a ScheduledActivity
const isScheduledActivity = (activity: any): activity is ScheduledActivity => {
  return 'imageUrl' in activity && 'day' in activity && 'hour' in activity;
}

export const SelectedActivitiesList = ({
  activities,
  onActivityRemove
}: SelectedActivitiesListProps) => {
  const { setNodeRef } = useDroppable({
    id: "selected-list"
  })
  
  const isMobile = useIsMobile()

  // Convert activities to ScheduledActivity format if needed
  const formattedActivities: ScheduledActivity[] = activities.map(activity => {
    if (isScheduledActivity(activity)) {
      return activity as ScheduledActivity;
    }
    return convertToScheduledActivity(activity as Activity);
  });

  return (
    <div className="w-full">
      <div ref={setNodeRef} className="w-full">
        {formattedActivities.length > 0 ? (
          <div className={`flex flex-wrap ${isMobile ? 'justify-center' : 'justify-start'} gap-3 sm:gap-4`}>
            {formattedActivities.map(activity => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onRemove={onActivityRemove}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="text-muted-foreground text-sm">
              Aucune activité sélectionnée
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Parcourez les activités et ajoutez-les à votre planning
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
