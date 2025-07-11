import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { bookingService } from "@/services/bookingService"
import { commissionService } from "@/services/commissionService"
import activityService from "@/services/activityService"
import { Booking, Earning, Activity, ActivityWithDetails } from "@/types/activity"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"
import { DashboardHeader } from "@/components/activity-owner/dashboard/DashboardHeader"
import RecentBookings from "@/components/activity-owner/dashboard/RecentBookings"
import EarningsChart from "@/components/activity-owner/dashboard/EarningsChart"
import { ActivityList } from "@/components/activity-owner/dashboard/ActivityList"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

export default function ActivityOwnerDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalBookings: 0,
    pendingEarnings: 0,
    totalActivities: 0,
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [earnings, setEarnings] = useState<{
    total: number
    monthly: Earning[]
    pending: number
  }>({ total: 0, monthly: [], pending: 0 })
  const [activities, setActivities] = useState<ActivityWithDetails[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const ownerId = user.id

        const [
          bookingStats,
          recentBookingsData,
          earningsData,
        ] = await Promise.all([
          bookingService.getBookingStats(ownerId),
          bookingService.fetchRecentBookingsForOwner(ownerId, 5),
          commissionService.fetchEarningsForOwner(ownerId),
        ])

        setStats({
          totalEarnings: earningsData.total,
          totalBookings: bookingStats.totalBookings,
          pendingEarnings: earningsData.pending,
          totalActivities: 0,
        })
        setRecentBookings(recentBookingsData)
        setEarnings(earningsData)
        const activitiesData = await activityService.fetchActivitiesByOwner(user.id);
        setActivities(activitiesData);
      } catch (error: any) {
        console.error("Failed to fetch dashboard ", error)
        toast({
          title: "Error",
          description:
            error.message || "Could not load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        ) : (
          <>
            <DashboardHeader stats={stats} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="lg:col-span-4">
                <EarningsChart earningsData={earnings.monthly} />
              </div>
              <div className="lg:col-span-3">
                <RecentBookings bookings={recentBookings} />
              </div>
            </div>
            <ActivityList activities={activities} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
  
