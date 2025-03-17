
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"
import { ScheduledActivity } from "./ExcursionPlanner"

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
            <div key={activity.id} className="flex items-center gap-4 p-2 border rounded-lg">
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
                  {activity.day} à {activity.hour}:00 ({activity.duration}h)
                </p>
                <p className="text-sm font-medium">฿{activity.price}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onActivityRemove(activity.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
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
