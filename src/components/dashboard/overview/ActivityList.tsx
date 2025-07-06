import { Activity, ActivityStatus } from "@/types/activity"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Edit, Eye } from "lucide-react"

interface ActivityListProps {
  activities: Activity[];
}

export function ActivityList({ activities }: ActivityListProps) {
  // Updated to accept any type for status to handle both string and number
  const getStatusVariant = (status: any): "default" | "secondary" | "outline" => {
    // Convert numeric status to string representation if needed
    let statusStr = typeof status === 'number' 
      ? status === 2 ? "published" : status === 1 ? "draft" : "archived"
      : String(status);
      
    switch (statusStr) {
      case "published":
      case "2":
        return "default"
      case "draft":
      case "1":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-white"
        >
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-medium">{activity.name || activity.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {activity.category_id ? `Category ID: ${activity.category_id}` : "Uncategorized"}
                </p>
              </div>
              <Badge
                variant={getStatusVariant(activity.status)}
              >
                {typeof activity.status === 'number'
                  ? activity.status === 2 ? "published" : activity.status === 1 ? "draft" : "archived"
                  : activity.status || "draft"}
              </Badge>
            </div>
            <div className="mt-2 text-sm">
              <span className="font-medium">
                {formatCurrency(activity.b_price || 0)}
              </span>
              {activity.final_price && (
                <span className="text-muted-foreground ml-2">
                  Final: {formatCurrency(activity.final_price)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/activities/${activity.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>
            <Link href={`/dashboard/activities/${activity.id}/edit`}>
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
