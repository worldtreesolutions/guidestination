import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"
import { ScheduledActivity } from "./ExcursionPlanner"
import { useDroppable, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

interface ActivityItemProps {
  activity: ScheduledActivity
  onRemove: (id: string) => void
}

const ActivityItem = ({ activity, onRemove }: ActivityItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    data: activity
  })

  const style = transform ? {
    transform: CSS.Translate.toString(transform)
  } : undefined

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove(activity.id)
  }

  if (isDragging) {
    return <div ref={setNodeRef} style={{ width: 150, height: 200, opacity: 0 }} />
  }

  return (
    <div className='relative' style={{ width: 150, height: 200 }}>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className='absolute inset-0 rounded-lg overflow-hidden border-2 border-primary bg-white shadow-lg cursor-move touch-none group transition-all duration-150'
      >
        <Image
          src={activity.imageUrl}
          alt={activity.title}
          fill
          className='object-cover'
        />
        <div className='absolute inset-0 bg-black/50'>
          <div className='p-3 text-white'>
            <div className='font-medium text-sm line-clamp-2'>{activity.title}</div>
            <div className='flex flex-col gap-1 mt-1'>
              <div className='text-xs bg-black/30 rounded px-2 py-1 inline-block'>
                {activity.duration}h
              </div>
              <div className='text-xs bg-black/30 rounded px-2 py-1 inline-block'>
                ฿{activity.price.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        className='absolute top-2 right-2 z-[200] rounded-full bg-red-500 hover:bg-red-600 p-1.5 cursor-pointer'
        onClick={handleRemove}
        type='button'
      >
        <X className='h-4 w-4 text-white' />
      </button>
    </div>
  )
}

interface SelectedActivitiesListProps {
  activities: ScheduledActivity[]
  onActivityRemove: (activityId: string) => void
}

export const SelectedActivitiesList = ({
  activities,
  onActivityRemove
}: SelectedActivitiesListProps) => {
  const { setNodeRef } = useDroppable({
    id: "selected-list"
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activités Sélectionnées</CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef}>
        <div className="flex flex-wrap gap-4">
          {activities.map(activity => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onRemove={onActivityRemove}
            />
          ))}
          {activities.length === 0 && (
            <p className="text-center text-muted-foreground py-4 w-full">
              Aucune activité sélectionnée
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}