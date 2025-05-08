import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity as CrudActivity } from "@/services/activityCrudService"; // Import the correct Activity type
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
import { Edit, Trash2, PlusCircle } from "lucide-react" // Ensure icons are imported

interface ActivityListProps {
  activities: CrudActivity[]; // Update props to use CrudActivity type
  onDelete: (activityId: number) => void // Keep onDelete prop
}

export function ActivityList({ activities, onDelete }: ActivityListProps) {

  const getStatusText = (status: number | null) => {
    switch (status) {
      case 2: return "Published";
      case 1: return "Draft";
      case 0: return "Archived";
      default: return "Unknown";
    }
  };

  const getStatusVariant = (status: number | null): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 2: return "default"; // Published
      case 1: return "secondary"; // Draft
      case 0: return "outline"; // Archived
      default: return "secondary";
    }
  };

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
        {!activities || activities.length === 0 ? (
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
                <TableHead>Status</TableHead>
                <TableHead>Price (THB)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusVariant(activity.status)}
                      className={getStatusVariant(activity.status) === 'default' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                    >
                      {getStatusText(activity.status)}
                    </Badge>
                  </TableCell>
                  {/* @ Corrected to use activity.price as per Activity type */}
                  <TableCell>{activity.price ? activity.price.toLocaleString() : 'N/A'}</TableCell>
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
                        <Trash2 className="h-4 w-4 mr-1" />
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