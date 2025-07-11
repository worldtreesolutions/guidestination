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
import { Activity } from "@/types/activity"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

interface ActivityListProps {
  activities: Activity[];
  onEdit?: (activity: Activity) => void;
  onView?: (activity: Activity) => void;
  onStatusChange?: (activityId: number, newStatus: number) => void;
}

export function ActivityList({ activities, onEdit, onView, onStatusChange }: ActivityListProps) {
  const getStatusColor = (status: number | null) => {
    switch (status) {
      case 1:
        return "bg-green-100 text-green-800"
      case 0:
        return "bg-yellow-100 text-yellow-800"
      case -1:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: number | null) => {
    switch (status) {
      case 1:
        return "published"
      case 0:
        return "draft"
      case -1:
        return "unpublished"
      default:
        return "draft"
    }
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => {
              const activityId = String(activity.id);
              return (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Image
                        src={activity.image_url || "/placeholder.svg"}
                        alt={activity.title}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                      <Link href={`/dashboard/activities/${activityId}`} className="font-medium hover:underline">
                        {activity.title}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>{activity.meeting_point}</TableCell>
                  <TableCell>
                    {activity.b_price
                      ? `฿${activity.b_price.toLocaleString()}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(activity.status)} variant="outline">
                      {getStatusText(activity.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/activities/${activityId}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (onStatusChange) {
                              onStatusChange(activity.id, -1)
                            }
                          }}
                        >
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Link href={`/dashboard/activities/${activityId}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
