
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity } from "@/services/activityService"
import Link from "next/link"
import { Edit, Trash2, Eye } from "lucide-react"

interface ActivityListProps {
  activities: Activity[]
  onDelete: (id: string) => void
}

export function ActivityList({ activities, onDelete }: ActivityListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Activities</CardTitle>
          <CardDescription>
            Manage your listed activities
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/activities/new">
            Add New Activity
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="mb-2 text-lg font-semibold">No activities yet</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              You haven't created any activities yet. Get started by adding your first activity.
            </p>
            <Button asChild>
              <Link href="/dashboard/activities/new">
                Add Your First Activity
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div>
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.price} THB · {activity.duration} hours
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/activities/${activity.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/activities/${activity.id}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDelete(activity.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
