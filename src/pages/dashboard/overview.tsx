import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Added router import
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { activityService, Booking, Activity } from "@/services/activityService";
import { Loader2 } from "lucide-react";
// Corrected import paths for dashboard components
import { EarningsChart } from "@/components/activity-owner/dashboard/EarningsChart"; // Changed to named import
import { RecentBookings } from "@/components/activity-owner/dashboard/RecentBookings"; // Changed to named import
import { ActivityList } from "@/components/activity-owner/dashboard/ActivityList"; // Changed to named import

interface EarningsData {
  total: number;
  monthly: { month: string; amount: number }[];
  pending: number;
}

export default function DashboardOverviewPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard/login"); // Redirect if not logged in
      return;
    }

    const fetchData = async () => {
      if (user) {
        try {
          setIsLoading(true);
          // Fetch all data concurrently
          const [earningsData, bookingsData, activitiesData] = await Promise.all([
            activityService.getProviderEarnings(user.id), // Assuming user has id
            activityService.getBookingsByProvider(user.id),
            activityService.getActivitiesByProvider(user.id)
          ]);

          setEarnings(earningsData);
          // Sort bookings by date descending and take the latest 5
          const sortedBookings = bookingsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentBookings(sortedBookings.slice(0, 5));
          setActivities(activitiesData);

        } catch (error) {
          console.error("Failed to fetch dashboard ", error);
          // Optionally show a toast message here
        } finally {
          setIsLoading(false);
        }
      } else {
        // Handle case where user is authenticated but user object is not yet available
        // This might indicate a state synchronization issue in AuthContext
        console.warn("User authenticated but user object is null.");
        // Optionally redirect or show loading state until user object is populated
        setIsLoading(false); // Stop loading even if user is null for now
      }
    };

    fetchData();
  }, [user, isAuthenticated, router]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Handle case where user is null after loading (should ideally not happen if authenticated)
  if (!user) {
     return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
           <p className="text-muted-foreground">Could not load user data.</p>
        </div>
      </DashboardLayout>
    );
  } // Ensure this closing brace is correct

  return ( // Ensure this return is correctly placed
    <>
      <Head>
        <title>Dashboard Overview - Guidestination</title>
        <meta name="description" content="Your provider dashboard overview." />
      </Head>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Header can be added here if needed */}
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>

          {/* Metrics Cards - Example Structure */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                {/* Icon can go here */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{earnings?.total?.toLocaleString() ?? '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total earnings from completed bookings
                </p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
                 {/* Icon can go here */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                   ฿{earnings?.pending?.toLocaleString() ?? '0'}
                </div>
                 <p className="text-xs text-muted-foreground">
                  Potential earnings from pending bookings
                </p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Activities</CardTitle>
                 {/* Icon can go here */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activities?.filter(a => a.status === 'published').length ?? '0'}
                </div>
                 <p className="text-xs text-muted-foreground">
                  Number of currently published activities
                </p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Bookings</CardTitle>
                 {/* Icon can go here */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  +{recentBookings?.length ?? '0'}
                </div>
                 <p className="text-xs text-muted-foreground">
                  New bookings in the last period (adjust logic)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Lists */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                 {/* Ensure EarningsChart receives valid data */}
                {earnings?.monthly ? (
                  <EarningsChart data={earnings.monthly} />
                ) : (
                  <p className="text-muted-foreground">No earnings data available.</p>
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your 5 most recent bookings.
                </p>
              </CardHeader>
              <CardContent>
                {recentBookings.length > 0 ? (
                  <RecentBookings bookings={recentBookings} />
                ) : (
                   <p className="text-muted-foreground">No recent bookings found.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity List */}
           <Card>
              <CardHeader>
                <CardTitle>Your Activities</CardTitle>
                 <p className="text-sm text-muted-foreground">
                  Overview of your listed activities.
                </p>
              </CardHeader>
              <CardContent>
                 {activities.length > 0 ? (
                   <ActivityList activities={activities} onDelete={() => {}} />
                 ) : (
                   <p className="text-muted-foreground">You haven&apos;t listed any activities yet.</p>
                 )}
              </CardContent>
            </Card>
        </div>
      </DashboardLayout>
    </>
  );
}