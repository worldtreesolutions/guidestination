import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Edit, Trash, Eye } from "lucide-react"
import { Activity as DatabaseActivity } from "@/types/activity"

// Define the Activity type that the component expects
interface ActivityCardProps {
  activity: DatabaseActivity;
  onDelete?: (id: number) => void;
  onStatusChange?: (id: number, status: number | string) => void;
  showActions?: boolean;
}

export default function ActivityCard({ 
  activity,
  onDelete,
  onStatusChange,
  showActions = true
}: ActivityCardProps) {
  const getStatusColor = (status: number | string | null): string => {
    if (typeof status === "number") {
      if (status === 2) return "bg-green-100 text-green-800";
      if (status === 1) return "bg-yellow-100 text-yellow-800";
      if (status === 0) return "bg-gray-100 text-gray-800";
    } else if (typeof status === "string") {
      if (status === "published") return "bg-green-100 text-green-800";
      if (status === "draft") return "bg-yellow-100 text-yellow-800";
      if (status === "archived") return "bg-gray-100 text-gray-800";
    }
    return "bg-yellow-100 text-yellow-800"; // Default to draft styling
  }

  const handleDelete = () => {
    if (onDelete && activity.id) {
      onDelete(activity.id);
    }
  }

  const handleStatusChange = (newStatus: number | string) => {
    if (onStatusChange && activity.id) {
      onStatusChange(activity.id, newStatus);
    }
  }

  const getImageUrl = (): string => {
    if (activity.image_url) {
      return typeof activity.image_url === 'string' 
        ? activity.image_url 
        : "/placeholder-activity.jpg";
    }
    
    return "/placeholder-activity.jpg";
  }

  // Use title if name is not available
  const displayName = activity.name || activity.title || "Unnamed Activity";

  const getStatusText = (status: number | string | null): string => {
    if (typeof status === "number") {
      if (status === 2) return "published";
      if (status === 1) return "draft";
      if (status === 0) return "archived";
    } else if (typeof status === "string") {
      return status;
    }
    return "draft";
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col shadow-sm hover:shadow transition-shadow duration-200">
      <div className="relative w-full aspect-[16/9] xs:aspect-video">
        <Image
          src={getImageUrl()}
          alt={displayName}
          fill
          className="object-cover"
          sizes="(max-width: 480px) 100vw, (max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
          priority
        />
        <Badge 
          variant="default"
          className={`absolute top-2 right-2 text-xs sm:text-sm ${getStatusColor(activity.status || null)}`}
        >
          {getStatusText(activity.status)}
        </Badge>
      </div>

      <CardHeader className="p-2 xs:p-3 sm:p-4 md:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-2">
          <div className="w-full sm:w-auto">
            <h3 className="text-sm xs:text-base sm:text-lg font-semibold line-clamp-1">{displayName}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
              {activity.category_id ? `Category ID: ${activity.category_id}` : "Uncategorized"}
            </p>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto mt-1 sm:mt-0">
            <p className="font-semibold text-xs xs:text-sm sm:text-base">{formatCurrency(activity.b_price || 0)}</p>
            {activity.final_price && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Final: {formatCurrency(activity.final_price)}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 xs:p-3 sm:p-4 md:p-5 pt-0 flex-grow">
        <p className="text-xs sm:text-sm line-clamp-2 text-muted-foreground">{activity.description}</p>
        <div className="mt-2 flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1">
          {activity.duration && (
            <p className="text-xs sm:text-sm">
              <span className="font-medium">Duration:</span> {activity.duration} hours
            </p>
          )}
          {activity.video_url && (
            <p className="text-xs sm:text-sm">
              <span className="font-medium">Video:</span> {activity.video_duration}s
            </p>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-2 xs:p-3 sm:p-4 md:p-5 pt-0 mt-auto">
          <div className="grid grid-cols-3 gap-1 xs:gap-2 w-full">
            <Link href={`/dashboard/activities/${activity.id}`} className="col-span-1">
              <Button variant="outline" size="sm" className="w-full h-8 xs:h-9 text-xs sm:text-sm">
                <Eye className="h-3 w-3 xs:h-4 xs:w-4 sm:mr-1" />
                <span className="hidden xs:inline-block sm:inline-block ml-1 sm:ml-0">View</span>
              </Button>
            </Link>
            <Link href={`/dashboard/activities/${activity.id}`} className="col-span-1">
              <Button variant="outline" size="sm" className="w-full h-8 xs:h-9 text-xs sm:text-sm">
                <Edit className="h-3 w-3 xs:h-4 xs:w-4 sm:mr-1" />
                <span className="hidden xs:inline-block sm:inline-block ml-1 sm:ml-0">Edit</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDelete}
              className="col-span-1 w-full h-8 xs:h-9 text-xs sm:text-sm"
            >
              <Trash className="h-3 w-3 xs:h-4 xs:w-4 sm:mr-1" />
              <span className="hidden xs:inline-block sm:inline-block ml-1 sm:ml-0">Delete</span>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
