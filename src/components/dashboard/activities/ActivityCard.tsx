
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Calendar,
  DollarSign,
  MapPin,
  Star
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SupabaseActivity } from "@/services/supabaseActivityService"
import Image from "next/image"

interface ActivityCardProps {
  activity: SupabaseActivity;
  onEdit?: (activity: SupabaseActivity) => void;
  onDelete?: (activityId: number) => void;
  onView?: (activity: SupabaseActivity) => void;
}

export function ActivityCard({ activity, onEdit, onDelete, onView }: ActivityCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    if (onEdit) {
      onEdit(activity)
    }
  }

  const handleDelete = async () => {
    if (onDelete && !isDeleting) {
      setIsDeleting(true)
      try {
        await onDelete(activity.id)
      } catch (error) {
        console.error("Error deleting activity:", error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleView = () => {
    if (onView) {
      onView(activity)
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return "Free"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive"
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        <Image
          src={activity.image_urls?.[0] || "/placeholder.jpg"}
          alt={activity.title}
          width={400}
          height={225}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={getStatusColor(activity.is_active)}>
            {getStatusText(activity.is_active)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{activity.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {activity.description}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatPrice(activity.price)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Max {activity.max_participants || 10}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{activity.location}</span>
          </div>
          {activity.rating && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{activity.rating} ({activity.review_count || 0})</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Badge variant="outline">
            {activity.category_name || "Uncategorized"}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {activity.booking_type === "daily" ? "Daily" : "Hourly"} booking
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
