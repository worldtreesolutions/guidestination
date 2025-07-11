import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";

interface BookingData {
  id: number;
  customer_name: string;
  activity_name: string | null;
  date: string;
  status: string | null;
  amount: number;
}

export default function DashboardOverviewPage() {
  const { user, session, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [recentBookings, setRecentBookings] = useState<BookingData[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/dashboard/login");
      return;
    }

    const fetchDashboardData = async () => {
      setIsDataLoading(true);
      try {
        // Fetch bookings with activity details
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            id,
            customer_name,
            booking_date,
            status,
            amount,
            activities (
              title
            )
          `)
          .eq("provider_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (bookingsError) {
          console.error("Error fetching bookings:", bookingsError);
        } else {
          const formattedBookings: BookingData[] = (bookingsData || []).map((booking: any) => ({
            id: booking.id,
            customer_name: booking.customer_name,
            activity_name: booking.activities?.title || "Unnamed Activity",
            date: booking.booking_date || new Date().toISOString(),
            status: booking.status || "pending",
            amount: booking.amount || 0
          }));
          
          setRecentBookings(formattedBookings);
          const total = formattedBookings.reduce((sum, booking) => sum + booking.amount, 0);
          setTotalEarnings(total);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading, router]);

  if (authLoading || isDataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-center">
            <p>{t("loading") || "Loading dashboard data..."}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Language Selector */}
        <div className="flex justify-end">
          <LanguageSelector />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold">{t("dashboard.overview.title") || "Dashboard Overview"}</h1>
        </div>
        
        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Earnings Card */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">{t("dashboard.overview.totalEarnings") || "Total Earnings"}</h2>
            <p className="text-2xl sm:text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
          </div>
          
          {/* Recent Bookings Card */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">{t("dashboard.overview.recentBookings") || "Recent Bookings"}</h2>
            {recentBookings.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {recentBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="border-b pb-2 last:border-b-0">
                    <p className="font-medium text-sm sm:text-base truncate">{booking.activity_name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{booking.customer_name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{new Date(booking.date).toLocaleDateString()}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{t("dashboard.overview.status") || "Status"}: {booking.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center text-sm sm:text-base">{t("dashboard.overview.noBookings") || "No recent bookings found"}</p>
            )}
          </div>
          
          {/* Quick Actions Card */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">{t("dashboard.overview.quickActions") || "Quick Actions"}</h2>
            <div className="space-y-2 sm:space-y-3">
              <button 
                onClick={() => router.push('/dashboard/activities/new')}
                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-[#ededed] text-foreground rounded-md hover:bg-[#e0e0e0] transition-colors text-sm sm:text-base"
              >
                {t("dashboard.overview.createActivity") || "Create New Activity"}
              </button>
              <button 
                onClick={() => router.push('/dashboard/bookings')}
                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                {t("dashboard.overview.viewBookings") || "View All Bookings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
