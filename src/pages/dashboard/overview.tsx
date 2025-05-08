
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Added router import
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// Import activityCrudService and its Activity type
import activityCrudService, { Activity as CrudActivity } from "@/services/activityCrudService"; 
// Keep Booking type if needed for recent bookings, adjust if necessary
import { activityService, Booking } from "@/services/activityService"; 
import { Loader2, AlertTriangle } from "lucide-react"; // Added AlertTriangle
// Corrected import paths for dashboard components
import { EarningsChart } from "@/components/dashboard/overview/EarningsChart"; // Corrected path
import { RecentBookings } from "@/components/dashboard/overview/RecentBookings"; // Corrected path
import { ActivityList } from "@/components/dashboard/overview/ActivityList"; // Corrected path

// @ Define a local Booking type matching RecentBookings component expectations
interface DisplayBooking {
  id: string; // Assuming booking ID is string, adjust if number
  activityName: string;
  customerName: string;
  date: Date;
  amount: number;
  status: "confirmed" | "pending" | "cancelled"; // Match component's status type
}

interface EarningsData {
  total: number;
  monthly: { month: string; amount: number }[];
  pending: number;
}

export default function DashboardOverviewPage() {
  const { user, session, isAuthenticated, isLoading: isAuthLoading } = useAuth(); // Get session and auth loading state
  const router = useRouter();
  const [isDataLoading, setIsDataLoading] = useState(true); // Separate state for data loading
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  // @ Use the local DisplayBooking type for recent bookings state
  const [recentBookings, setRecentBookings] = useState<DisplayBooking[]>([]); 
  const [activities, setActivities] = useState<CrudActivity[]>([]); 
  const [providerId, setProviderId] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null); // State for fetch errors

  // Effect 1: Handle Authentication Status and Redirects
  useEffect(() => {
    console.log('[Auth Effect] Running - isAuthLoading:', isAuthLoading, 'isAuthenticated:', isAuthenticated);
    if (!isAuthLoading && !isAuthenticated) {
      console.log('[Auth Effect] Redirecting to login.');
      router.push("/dashboard/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Effect 2: Set Provider ID once user is available
  useEffect(() => {
    console.log('[Provider ID Effect] Running - User:', user ? user.id : 'null');
    if (user?.app_metadata?.provider_id) {
      const fetchedProviderId = Number(user.app_metadata.provider_id);
      if (!isNaN(fetchedProviderId)) {
        setProviderId(fetchedProviderId);
        console.log('[Provider ID Effect] Provider ID set:', fetchedProviderId);
      } else {
        console.warn('[Provider ID Effect] provider_id in metadata is not a valid number:', user.app_metadata.provider_id);
        setProviderId(null); // Explicitly set to null if invalid
      }
    } else if (user) {
      console.warn('[Provider ID Effect] Provider ID not found in user metadata.');
      setProviderId(null); // Explicitly set to null if not found
    }
    // This effect only depends on the user object
  }, [user]);

  // Effect 3: Fetch Data when authenticated and providerId is known
  useEffect(() => {
    // Only proceed if authentication is resolved, user is authenticated, and providerId is set
    if (!isAuthLoading && isAuthenticated && providerId !== null) {
      console.log('[Data Fetch Effect] Conditions met. Fetching data for providerId:', providerId);
      const fetchData = async () => {
        // Ensure user object and ID are available before fetching
        if (!user?.id) {
           console.error('[Data Fetch Effect] User ID is missing, cannot fetch data.');
           setFetchError('User information is missing.');
           setIsDataLoading(false);
           return;
        }
        
        setIsDataLoading(true); // Start data loading
        setFetchError(null); // Reset error
        try {
          console.log('[Data Fetch Effect] Fetching earnings, bookings, activities...');
          // Fetch all data concurrently
          const [earningsData, bookingsData, activitiesResult] = await Promise.all([
            activityService.getProviderEarnings(user.id), // Use user.id safely
            // @ Use getBookingsByProvider instead of getDetailedBookingsByProvider
            activityService.getBookingsByProvider(user.id), // Use correct fetch method
            activityCrudService.getActivitiesByProviderId(providerId) // Use fetched providerId
          ]);
          console.log('[Data Fetch Effect] Data fetched successfully.');
          console.log('[Data Fetch Effect] Fetched Activities:', activitiesResult.activities); // Log fetched activities
          console.log('[Data Fetch Effect] Fetched Bookings:', bookingsData); // Log fetched bookings

          setEarnings(earningsData);
          
          // @ Map fetched bookings to the DisplayBooking type
          // Ensure the properties used here (id, activity_name, etc.) match what getBookingsByProvider returns
          const mappedBookings: DisplayBooking[] = bookingsData 
            .map((b: any) => ({ // Use 'any' temporarily if type is complex/unknown
              id: b.id.toString(), // Ensure ID is string
              activityName: b.activity_name || 'Unknown Activity', // Use fetched activity name (adjust if property name differs)
              customerName: b.customer_name || 'Unknown Customer', // Adjust if property name differs
              date: new Date(b.booking_date || b.created_at), // Use booking_date or fallback
              amount: b.total_price || 0, // Use fetched total price (adjust if property name differs)
              status: b.status || 'pending', // Use fetched status
            }))
             // @ Add explicit types for sort parameters
            .sort((a: DisplayBooking, b: DisplayBooking) => b.date.getTime() - a.date.getTime());

          setRecentBookings(mappedBookings.slice(0, 5));
          setActivities(activitiesResult.activities); // Update activities state

        } catch (error: any) {
          console.error("[Data Fetch Effect] Failed to fetch dashboard ", error);
          setFetchError(`Failed to load dashboard  ${error.message}`); // More specific error
          // Optionally show a toast message here
        } finally {
          console.log('[Data Fetch Effect] Setting isDataLoading to false.');
          setIsDataLoading(false); // Finish data loading regardless of success/error
        }
      };

      fetchData();
    } else if (!isAuthLoading && isAuthenticated && providerId === null) {
      // Handle case where user is authenticated but providerId is missing/invalid
      console.error('[Data Fetch Effect] Authenticated user is missing a valid provider ID.');
      setFetchError('Your account is not linked to a provider ID. Please contact support.');
      setIsDataLoading(false); // Stop loading as we can't fetch data
    } else if (!isAuthLoading && !isAuthenticated) {
       // If not authenticated (and auth check is done), stop loading
       console.log('[Data Fetch Effect] User not authenticated, stopping data loading.');
       setIsDataLoading(false);
    }
    // Dependencies: run when auth state, user, or providerId changes
  }, [isAuthLoading, isAuthenticated, user, providerId]); 

  // Combined Loading State Check
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

  // Handle case where user is null after loading (should ideally not happen if authenticated)
  if (!user) {
     return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
           <p className="text-muted-foreground">Could not load user data.</p>
        </div>
      </DashboardLayout>
    );
  } 

  return ( 
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
                  {/* Corrected: Compare status with number 2 for 'published'/'active' */}
                  {activities?.filter(a => a.status === 2).length ?? '0'}
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
