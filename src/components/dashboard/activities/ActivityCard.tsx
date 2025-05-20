
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Edit, Trash, Eye } from "lucide-react"

// Define the Activity type based on what's available in the component
interface Activity {
  id: number;
  activity_id: string | number;
  name: string;
  title?: string;
  description?: string;
  category?: string;
  price: number;
  final_price?: number;
  status?: string | number;
  duration?: string | number;
  video_url?: string;
  video_duration?: number;
  photos?: string[] | any[];
  image_url?: string;
}

// Define the ActivityStatus type
type ActivityStatus = string | number;

interface ActivityCardProps {
  activity: Activity;
  onDelete?: (id: number) => void;
  onStatusChange?: (id: number, status: ActivityStatus) => void;
  showActions?: boolean;
}

export default function ActivityCard({ 
  activity,
  onDelete,
  onStatusChange,
  showActions = true
}: ActivityCardProps) {
  const getStatusColor = (status: ActivityStatus | null): string => {
    if (status === 2 || status === "published") {
      return "bg-green-100 text-green-800";
    } else if (status === 1 || status === "draft") {
      return "bg-yellow-100 text-yellow-800";
    } else if (status === 0 || status === "archived") {
      return "bg-gray-100 text-gray-800";
    }
    return "bg-yellow-100 text-yellow-800"; // Default to draft styling
  }

  const handleDelete = () => {
    if (onDelete && activity.id) {
      onDelete(activity.id);
    }
  }

  const handleStatusChange = (newStatus: ActivityStatus) => {
    if (onStatusChange && activity.id) {
      onStatusChange(activity.id, newStatus);
    }
  }

  const getImageUrl = (): string => {
    if (activity.image_url) {
      return activity.image_url;
    }
    
    if (activity.photos && Array.isArray(activity.photos) && activity.photos.length > 0) {
      const firstPhoto = activity.photos[0];
      return typeof firstPhoto === "string" ? firstPhoto : "/placeholder-activity.jpg";
    }
    
    return "/placeholder-activity.jpg";
  }

  // Use title if name is not available
  const displayName = activity.name || activity.title || "Unnamed Activity";

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        <Image
          src={getImageUrl()}
          alt={displayName}
          fill
          className="object-cover"
        />
        <Badge 
          variant="default"
          className={`absolute top-2 right-2 ${getStatusColor(activity.status || null)}`}
        >
          {activity.status === 2 ? "published" : 
           activity.status === 1 ? "draft" : 
           activity.status === 0 ? "archived" : "draft"}
        </Badge>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{displayName}</h3>
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
        {activity.video_url && (
          <p className="text-sm mt-2">
            Video: {activity.video_duration}s
          </p>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="flex justify-between gap-2">
          <Link href={`/dashboard/activities/${activity.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </Link>
          <Link href={`/dashboard/activities/[activityId]/edit`} as={`/dashboard/activities/${activity.id}/edit`}>
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
