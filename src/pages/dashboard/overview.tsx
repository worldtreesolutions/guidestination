
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

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
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Total Earnings</h2>
          <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="border-b pb-2">
                <p className="font-medium">{booking.activity_name}</p>
                <p className="text-sm text-gray-600">{booking.customer_name}</p>
                <p className="text-sm text-gray-600">{new Date(booking.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Status: {booking.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
