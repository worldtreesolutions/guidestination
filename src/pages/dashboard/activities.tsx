import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout" // Corrected import path
import { activityService, Activity } from "@/services/activityService"
import { useToast } from "@/hooks/use-toast"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash, PlusCircle } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function ActivitiesPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard/login")
      return
    }

    const fetchActivities = async () => {
      if (!user) return
      
      try {
        const activitiesData = await activityService.getActivitiesByProvider(user.id)
        setActivities(activitiesData)
      } catch (error) {
        console.error("Error fetching activities:", error)
        toast({
          title: "Error",
          description: "Failed to load activities. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [user, isAuthenticated, router, toast])

  const handleDeleteActivity = async () => {
    if (!activityToDelete) return
    
    try {
      await activityService.deleteActivity(activityToDelete)
      setActivities(activities.filter(activity => activity.id !== activityToDelete))
      toast({
        title: "Activity deleted",
        description: "The activity has been successfully deleted."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete activity. Please try again.",
        variant: "destructive"
      })
    } finally {
      setActivityToDelete(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading activities...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Manage Activities - Provider Dashboard</title>
        <meta name="description" content="Manage your listed activities" />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Activities</h1>
              <p className="text-muted-foreground">
                View, edit, and manage all your listed activities.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/activities/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Activity
              </Link>
            </Button>
          </div>

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
            <div className="rounded-md border">
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
                            onClick={() => setActivityToDelete(activity.id)}
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
            </div>
          )}
        </div>

        <AlertDialog open={!!activityToDelete} onOpenChange={(open) => !open && setActivityToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the activity and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteActivity}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </>
  )
}