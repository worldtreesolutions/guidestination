import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageSelector } from "@/components/layout/LanguageSelector"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"
import { DashboardHeader } from "@/components/activity-owner/dashboard/DashboardHeader"
import { ActivityList } from "@/components/activity-owner/dashboard/ActivityList"
import { RecentBookings } from "@/components/activity-owner/dashboard/RecentBookings"
import { EarningsChart } from "@/components/activity-owner/dashboard/EarningsChart"
import { supabaseActivityService } from "@/services/supabaseActivityService"
import { SupabaseActivity, Booking, Earning } from "@/types/activity"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function ActivityOwnerDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [activities, setActivities] = useState<SupabaseActivity[]>([])
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/activity-owner/login")
      return
    }

    const fetchDashboardData = async () => {
      if (user) {
        try {
          setLoading(true);
          const [activities, recentBookings, earnings] = await Promise.all([
            supabaseActivityService.fetchActivitiesByOwner(user.id),
            supabaseActivityService.fetchRecentBookingsForOwner(user.id),
            supabaseActivityService.fetchEarningsForOwner(user.id),
          ]);
          setActivities(activities);
          setBookings(recentBookings);
          setEarnings(earnings as any);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchDashboardData()
  }, [user, router, toast, t])

  const handleDeleteActivity = async () => {
    if (!activityToDelete) return;
    try {
      await supabaseActivityService.deleteActivity(parseInt(activityToDelete));
      setActivities(activities.filter((a) => a.id.toString() !== activityToDelete));
      toast({
        title: "Success",
        description: "Activity deleted successfully.",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Could not delete activity.",
        variant: "destructive",
      });
    } finally {
      setActivityToDelete(null);
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>{t("loading") || "Loading dashboard..."}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <Head>
        <title>{t("activityOwner.meta.title") || "Activity Provider Dashboard - Guidestination"}</title>
        <meta name="description" content={t("activityOwner.meta.description") || "Manage your activities and bookings"} />
      </Head>

      <DashboardLayout>
        <div className="space-y-8">
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>

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
            onDelete={(id) => setActivityToDelete(id.toString())}
          />

          <RecentBookings bookings={bookings.slice(0, 5)} />
        </div>

        <AlertDialog open={!!activityToDelete} onOpenChange={(open) => !open && setActivityToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirm.delete.title") || "Are you sure?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("confirm.delete.description") || "This action cannot be undone. This will permanently delete the activity and remove it from our servers."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("button.cancel") || "Cancel"}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteActivity}>{t("button.delete") || "Delete"}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </>
  )
}
