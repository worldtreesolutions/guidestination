import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Users, DollarSign } from "lucide-react";

interface BookingDetails {
  id: string;
  activityName: string;
  participants: number;
  totalAmount: number;
  bookingDate: string;
  customerName: string;
  customerEmail: string;
}

export default function BookingSuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session_id) {
      fetchBookingDetails(session_id as string);
    }
  }, [session_id]);

  const fetchBookingDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/booking/details?session_id=${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch booking details");
      }

      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">!</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Booking</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push("/")} className="w-full">
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Booking Confirmed!</CardTitle>
            <p className="text-gray-600">Your activity has been successfully booked.</p>
          </CardHeader>
          
          {booking && (
            <CardContent className="space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Activity</p>
                      <p className="text-gray-600">{booking.activityName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-gray-600">{booking.participants} people</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Total Amount</p>
                      <p className="text-gray-600">${booking.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {booking.customerName}</p>
                  <p><span className="font-medium">Email:</span> {booking.customerEmail}</p>
                  <p><span className="font-medium">Booking ID:</span> {booking.id}</p>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• You'll receive a confirmation email shortly</li>
                    <li>• The activity provider will contact you with details</li>
                    <li>• Check your email for any additional instructions</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
                  Browse More Activities
                </Button>
                <Button onClick={() => router.push("/dashboard/bookings")} className="flex-1">
                  View My Bookings
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}