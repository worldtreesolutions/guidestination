
import { Activity, ActivityStatus } from "@/types/activity"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Edit, Trash, Eye } from "lucide-react"

interface ActivityCardProps {
  activity: Activity;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: ActivityStatus) => void;
  showActions?: boolean;
}

export function ActivityCard({ 
  activity,
  onDelete,
  onStatusChange,
  showActions = true
}: ActivityCardProps) {
  const statusColor = {
    draft: "bg-yellow-100 text-yellow-800",
    published: "bg-green-100 text-green-800",
    archived: "bg-gray-100 text-gray-800"
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(activity.activity_id)
    }
  }

  const handleStatusChange = (newStatus: ActivityStatus) => {
    if (onStatusChange) {
      onStatusChange(activity.activity_id, newStatus)
    }
  }

  const imageUrl = activity.photos && Array.isArray(activity.photos) && activity.photos.length > 0
    ? activity.photos[0]
    : "/placeholder-activity.jpg"

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        <Image
          src={imageUrl}
          alt={activity.name}
          fill
          className="object-cover"
        />
        <Badge 
          className={`absolute top-2 right-2 ${statusColor[activity.status as ActivityStatus || "draft"]}`}
        >
          {activity.status || "draft"}
        </Badge>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{activity.name}</h3>
            <p className="text-sm text-muted-foreground">{activity.category}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(activity.price)}</p>
            {activity.final_price && (
              <p className="text-sm text-muted-foreground">
                Final: {formatCurrency(activity.final_price)}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm line-clamp-2">{activity.description}</p>
        {activity.duration && (
          <p className="text-sm mt-2">Duration: {activity.duration} hours</p>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="flex justify-between gap-2">
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
