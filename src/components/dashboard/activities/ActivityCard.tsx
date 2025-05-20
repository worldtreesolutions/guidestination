
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
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-video w-full">
        <Image
          src={getImageUrl()}
          alt={displayName}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

      <CardHeader className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div className="w-full sm:w-auto">
            <h3 className="text-base sm:text-lg font-semibold line-clamp-1">{displayName}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{activity.category}</p>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto mt-1 sm:mt-0">
            <p className="font-semibold text-sm sm:text-base">{formatCurrency(activity.price)}</p>
            {activity.final_price && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Final: {formatCurrency(activity.final_price)}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 md:p-6 pt-0 flex-grow">
        <p className="text-xs sm:text-sm line-clamp-2">{activity.description}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {activity.duration && (
            <p className="text-xs sm:text-sm">Duration: {activity.duration} hours</p>
          )}
          {activity.video_url && (
            <p className="text-xs sm:text-sm">
              Video: {activity.video_duration}s
            </p>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row gap-2 mt-auto">
          <div className="grid grid-cols-3 gap-2 w-full">
            <Link href={`/dashboard/activities/${activity.id}`} className="col-span-1">
              <Button variant="outline" size="sm" className="w-full h-9">
                <Eye className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">View</span>
              </Button>
            </Link>
            <Link href={`/dashboard/activities/${activity.id}`} className="col-span-1">
              <Button variant="outline" size="sm" className="w-full h-9">
                <Edit className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDelete}
              className="col-span-1 w-full h-9"
            >
              <Trash className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
