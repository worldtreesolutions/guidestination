
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { ProviderLayout } from "@/components/activity-owner/layout/ProviderLayout"
import { DashboardHeader } from "@/components/activity-owner/dashboard/DashboardHeader"
import { EarningsChart } from "@/components/activity-owner/dashboard/EarningsChart"
import { RecentBookings } from "@/components/activity-owner/dashboard/RecentBookings"
import { ActivityList } from "@/components/activity-owner/dashboard/ActivityList"
import { activityService, Activity, Booking } from "@/services/activityService"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [activities, setActivities] = useState<Activity[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [earnings, setEarnings] = useState<{
    total: number
    monthly: { month: string; amount: number }[]
    pending: number
  }>({
    total: 0,
    monthly: [],
    pending: 0
  })
  const [loading, setLoading] = useState(true)
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/activity-owner/login")
      return
    }

    const fetchData = async () => {
      if (!user) return
      
      try {
        const [activitiesData, bookingsData, earningsData] = await Promise.all([
          activityService.getActivitiesByProvider(user.id),
          activityService.getBookingsByProvider(user.id),
          activityService.getProviderEarnings(user.id)
        ])
        
        setActivities(activitiesData)
        setBookings(bookingsData)
        setEarnings(earningsData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  if (loading || !user) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading dashboard...</p>
        </div>
      </ProviderLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Activity Provider Dashboard - Guidestination</title>
        <meta name="description" content="Manage your activities and bookings" />
      </Head>

      <ProviderLayout>
        <div className="space-y-8">
          <DashboardHeader 
            user={user}
            stats={{
              totalActivities: activities.length,
              totalBookings: bookings.length,
              totalEarnings: earnings.total,
              pendingEarnings: earnings.pending
            }}
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <EarningsChart data={earnings.monthly} />
          </div>

          <ActivityList 
            activities={activities} 
            onDelete={(id) => setActivityToDelete(id)} 
          />

          <RecentBookings bookings={bookings.slice(0, 5)} />
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
      </ProviderLayout>
    </>
  )
}
