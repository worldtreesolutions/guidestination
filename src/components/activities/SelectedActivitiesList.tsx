
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"
import { ScheduledActivity } from "./ExcursionPlanner"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface ActivityItemProps {
  activity: ScheduledActivity
  onRemove: (id: string) => void
}

const ActivityItem = ({ activity, onRemove }: ActivityItemProps) => {
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "move"
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-4 p-2 border rounded-lg bg-white"
    >
      <div className="relative w-16 h-16">
        <Image
          src={activity.imageUrl}
          alt={activity.title}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{activity.title}</h4>
        <p className="text-sm text-muted-foreground">
          Durée: {activity.duration}h
        </p>
        <p className="text-sm font-medium">฿{activity.price}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(activity.id)}
      >
        <X className="h-4 w-4" />
      </Button>
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activités Sélectionnées</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map(activity => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onRemove={onActivityRemove}
            />
          ))}
          {activities.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Aucune activité sélectionnée
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
