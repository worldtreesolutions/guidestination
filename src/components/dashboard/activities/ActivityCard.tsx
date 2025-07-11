import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import { SupabaseActivity } from "@/types/activity"
import Image from "next/image"
import Link from "next/link"
import { Activity } from "@/types/activity"

interface ActivityCardProps {
  activity: Activity
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onPreview: (id: number) => void
}

export function ActivityCard({ activity, onEdit, onDelete, onPreview }: ActivityCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    if (onEdit) {
      onEdit(activity.id)
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
    if (onPreview) {
      onPreview(activity.id)
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

  const getStatusColor = (isActive: boolean | null) => {
    if (isActive === null) return "bg-gray-100 text-gray-800"
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getStatusText = (isActive: boolean | null) => {
    if (isActive === null) return "Unknown"
    return isActive ? "Active" : "Inactive"
  }

  const getStatusVariant = (
    status: "published" | "draft" | "unpublished" | "archived" | null | undefined
  ): "outline" => {
    return "outline"
  }

  const getStatusPill = (
    status: "published" | "unpublished" | "draft" | "archived"
  ) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Published
          </Badge>
        )
      case "unpublished":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Unpublished
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Draft
          </Badge>
        )
      case "archived":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600">
            Archived
          </Badge>
        )
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        <Link href={`/dashboard/activities/${activity.id}`}>
          <Image
            src={activity.image_url || '/placeholder.svg'}
            alt={activity.title}
            width={300}
            height={169}
            className="w-full h-full object-cover"
          />
        </Link>
        <div className="absolute top-2 right-2">
          <Badge className={getStatusColor(activity.is_active)}>
            {getStatusText(activity.is_active)}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant={String(activity.status) as "published" | "draft" | "unpublished" | "archived"}>
            {String(activity.status)}
          </Badge>
        </div>
        {activity.categories?.name && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            {activity.categories.name}
          </Badge>
        )}
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
            <span className="font-medium">{formatPrice(activity.b_price)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Max {activity.max_participants || 10}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{activity.meeting_point}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Badge variant="outline">
            {activity.category_name || "Uncategorized"}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {activity.duration ? `${activity.duration} hours` : ''}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {activity.max_participants} participants
          </p>
          <p className="text-lg font-semibold">
            ฿{activity.b_price?.toLocaleString()}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 bg-gray-50 p-4">
        {activity.status && getStatusPill(activity.status as "published" | "unpublished" | "draft" | "archived")}
      </CardFooter>
    </Card>
  )
}
