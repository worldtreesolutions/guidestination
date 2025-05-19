
import { Activity } from "@/types/activity"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Edit, Eye } from "lucide-react"

interface ActivityListProps {
  activities: Activity[];
}

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.activity_id}
          className="flex items-center justify-between p-4 border rounded-lg bg-white"
        >
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-medium">{activity.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {activity.category || "Uncategorized"}
                </p>
              </div>
              <Badge
                variant={
                  activity.status === "published"
                    ? "success"
                    : activity.status === "draft"
                    ? "warning"
                    : "secondary"
                }
              >
                {activity.status || "draft"}
              </Badge>
            </div>
            <div className="mt-2 text-sm">
              <span className="font-medium">
                {formatCurrency(activity.price)}
              </span>
              {activity.final_price && (
                <span className="text-muted-foreground ml-2">
                  Final: {formatCurrency(activity.final_price)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/activities/${activity.activity_id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>
            <Link href={`/dashboard/activities/${activity.activity_id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
