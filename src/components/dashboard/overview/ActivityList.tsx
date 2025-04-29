
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "@/services/activityService"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash, PlusCircle } from "lucide-react"

interface ActivityListProps {
  activities: Activity[]
  onDelete: (activityId: string) => void
}

export function ActivityList({ activities, onDelete }: ActivityListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Activities</CardTitle>
          <CardDescription>
            Manage your listed activities
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/activities/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Activity
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="mb-2 text-lg font-semibold">No activities yet</h3>
            <p className="text-sm text-muted-foreground">
              You haven't created any activities yet. Get started by creating one!
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/activities/new">
                Create New Activity
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price (THB)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell>{activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}</TableCell>
                  <TableCell>{activity.basePrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={activity.status === 'published' ? 'default' : 'secondary'}
                      className={activity.status === 'published' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                    >
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/activities/${activity.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onDelete(activity.id)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
