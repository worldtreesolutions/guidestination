
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { activityService, Activity } from "@/services/activityService"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ActivitiesPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

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
                Manage your listed activities and create new ones.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/activities/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Activity
              </Link>
            </Button>
          </div>

          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">No activities yet</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                You haven't created any activities yet. Get started by adding your first activity.
              </p>
              <Button asChild>
                <Link href="/dashboard/activities/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Activity
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 lg:w-1/4 h-48 sm:h-auto relative">
                      {activity.images && activity.images[0] && (
                        <img 
                          src={activity.images[0]} 
                          alt={activity.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">{activity.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {activity.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                              {activity.category}
                            </span>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                              {activity.duration} hours
                            </span>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                              {activity.price} THB
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 mt-4 sm:mt-0">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/activities/${activity.id}`}>
                              Edit
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/activities/${activity.id}/bookings`}>
                              View Bookings
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  )
}
