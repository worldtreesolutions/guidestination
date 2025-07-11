
import { Activity } from "@/types/activity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Trash2 } from "lucide-react"
import Link from "next/link"

interface ActivityListProps {
  activities: Activity[]
  onDelete?: (id: string) => void
}

export function ActivityList({ activities, onDelete }: ActivityListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 hover:bg-green-100/80"
      case "draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
      case "unpublished":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Activities</CardTitle>
          <CardDescription>
            Manage your listed experiences
          </CardDescription>
        </div>
        <Link href="/activity-owner/list-activity">
          <Button>Add New Activity</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length > 0 ? (
              activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell>{activity.location || "Not specified"}</TableCell>
                  <TableCell>฿{activity.price?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(activity.status)} variant="outline">
                      {activity.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {activity.average_rating ? (
                      <div className="flex items-center">
                        <span className="mr-1">{activity.average_rating.toFixed(1)}</span>
                        <span className="text-yellow-500">★</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({activity.reviews_count || 0})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No ratings</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/activities/${activity.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/activity-owner/edit-activity/${activity.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(activity.id.toString())}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No activities found. Create your first activity to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
