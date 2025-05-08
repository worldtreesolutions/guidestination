
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router"; 
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import activityCrudService, { Activity as CrudActivity } from "@/services/activityCrudService"; 
import { activityService, Booking } from "@/services/activityService"; 
import { Loader2, AlertTriangle } from "lucide-react"; 
import { EarningsChart } from "@/components/dashboard/overview/EarningsChart"; 
import { RecentBookings } from "@/components/dashboard/overview/RecentBookings"; 
import { ActivityList } from "@/components/dashboard/overview/ActivityList"; 

interface DisplayBooking {
  id: string; 
  activityName: string;
  customerName: string;
  date: Date;
  amount: number;
  status: "confirmed" | "pending" | "cancelled"; 
}

interface EarningsData {
  total: number;
  monthly: { month: string; amount: number }[];
  pending: number;
}

export default function DashboardOverviewPage() {
  const { user, session, isAuthenticated, isLoading: isAuthLoading } = useAuth(); 
  const router = useRouter();
  const [isDataLoading, setIsDataLoading] = useState(true); 
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [recentBookings, setRecentBookings] = useState<DisplayBooking[]>([]); 
  const [activities, setActivities] = useState<CrudActivity[]>([]); 
  const [providerId, setProviderId] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null); 

  useEffect(() => {
    console.log('[Auth Effect] Running - isAuthLoading:', isAuthLoading, 'isAuthenticated:', isAuthenticated);
    if (!isAuthLoading && !isAuthenticated) {
      console.log('[Auth Effect] Redirecting to login.');
      router.push("/dashboard/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  useEffect(() => {
    console.log('[Provider ID Effect] Running - User:', user ? user.id : 'null');
    if (user?.app_metadata?.provider_id) {
      const fetchedProviderId = Number(user.app_metadata.provider_id);
      if (!isNaN(fetchedProviderId)) {
        setProviderId(fetchedProviderId);
        console.log('[Provider ID Effect] Provider ID set:', fetchedProviderId);
      } else {
        console.warn('[Provider ID Effect] provider_id in metadata is not a valid number:', user.app_metadata.provider_id);
        setProviderId(null); 
      }
    } else if (user) {
      console.warn('[Provider ID Effect] Provider ID not found in user metadata.');
      setProviderId(null); 
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && providerId !== null) {
      console.log('[Data Fetch Effect] Conditions met. Fetching data for providerId:', providerId);
      const fetchData = async () => {
        if (!user?.id) {
           console.error('[Data Fetch Effect] User ID is missing, cannot fetch data.');
           setFetchError('User information is missing.');
           setIsDataLoading(false);
           return;
        }
        
        setIsDataLoading(true); 
        setFetchError(null); 
        try {
          console.log('[Data Fetch Effect] Fetching earnings, bookings, activities...');
          const [earningsData, bookingsData, activitiesResult] = await Promise.all([
            activityService.getProviderEarnings(user.id), 
            activityService.getBookingsByProvider(user.id), 
            activityCrudService.getActivitiesByProviderId(providerId) 
          ]);
          console.log('[Data Fetch Effect] Data fetched successfully.');
          console.log('[Data Fetch Effect] Fetched Activities:', activitiesResult.activities); 
          console.log('[Data Fetch Effect] Fetched Bookings:', bookingsData); 

          setEarnings(earningsData);
          
          const mappedBookings: DisplayBooking[] = bookingsData 
            .map((b: any) => ({ 
              id: b.id.toString(), 
              activityName: b.activity_name || 'Unknown Activity', 
              customerName: b.customer_name || 'Unknown Customer', 
              date: new Date(b.booking_date || b.created_at), 
              amount: b.total_price || 0, 
              status: b.status || 'pending', 
            }))
            .sort((a: DisplayBooking, b: DisplayBooking) => b.date.getTime() - a.date.getTime());

          setRecentBookings(mappedBookings.slice(0, 5));
          setActivities(activitiesResult.activities); 

        } catch (error: any) {
          console.error("[Data Fetch Effect] Failed to fetch dashboard ", error);
          setFetchError(`Failed to load dashboard  ${error.message}`); 
        } finally {
          console.log('[Data Fetch Effect] Setting isDataLoading to false.');
          setIsDataLoading(false); 
        }
      };

      fetchData();
    } else if (!isAuthLoading && isAuthenticated && providerId === null) {
      console.error('[Data Fetch Effect] Authenticated user is missing a valid provider ID.');
      setFetchError('Your account is not linked to a provider ID. Please contact support.');
      setIsDataLoading(false); 
    } else if (!isAuthLoading && !isAuthenticated) {
       console.log('[Data Fetch Effect] User not authenticated, stopping data loading.');
       setIsDataLoading(false);
    }
  }, [isAuthLoading, isAuthenticated, user, providerId]); 

  const isLoading = isAuthLoading || isDataLoading;

  if (isLoading) {
    console.log('Rendering Loading State - isAuthLoading:', isAuthLoading, 'isDataLoading:', isDataLoading);
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
     return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
           <p className="text-muted-foreground">Could not load user data.</p>
        </div>
      </DashboardLayout>
    );
  } 

  // Count active activities (status === 2)
  const activeActivitiesCount = activities.filter(a => a.status === 2).length;

  return ( 
    <>
      <Head>
        <title>Dashboard Overview - Guidestination</title>
        <meta name="description" content="Your provider dashboard overview." />
      </Head>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
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
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeActivitiesCount}
                </div>
                 <p className="text-xs text-muted-foreground">
                  Number of currently published activities
                </p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentBookings.length}
                </div>
                 <p className="text-xs text-muted-foreground">
                  New bookings in the last period
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {earnings?.monthly ? (
                  <EarningsChart data={earnings.monthly.map(item => ({ month: item.month, earnings: item.amount }))} />
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
