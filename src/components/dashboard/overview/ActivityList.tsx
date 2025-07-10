import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SupabaseActivity } from "@/services/supabaseActivityService"
import Image from "next/image"

interface ActivityListProps {
  activities: SupabaseActivity[];
  onEdit?: (activity: SupabaseActivity) => void;
  onView?: (activity: SupabaseActivity) => void;
}

export function ActivityList({ activities, onEdit, onView }: ActivityListProps) {
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

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No activities found. Create your first activity to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={activity.image_url?.[0] || '/placeholder.svg'}
                      alt={activity.title}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{activity.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(activity.is_active)}>
                          {getStatusText(activity.is_active)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatPrice(activity.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(activity)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(activity)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
