import { useEffect, useState } from "react";
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Users, DollarSign } from "lucide-react";

interface BookingDetails {
  sessionId: string;
  type: string;
  isCartCheckout: boolean;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
  booking?: {
    id: string;
    activity: {
      id: number;
      title: string;
      meeting_point?: string;
      duration?: string;
      image_url?: string;
    };
    participants: number;
    amount: number;
    status: string;
    bookingDate?: string;
  };
  bookings?: Array<{
    id: string;
    activity: {
      id: number;
      title: string;
      meeting_point?: string;
      duration?: string;
      image_url?: string;
    };
    participants: number;
    amount: number;
    status: string;
  }>;
}

export default function BookingSuccessPage() {
  const { currency, convert } = useCurrency();
  const router = useRouter();
  const { session_id, type } = router.query;
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) return;
    
    console.log('Router query:', router.query);
    console.log('session_id:', session_id);
    console.log('type:', type);
    
    if (session_id && typeof session_id === 'string') {
      fetchBookingDetails(session_id);
    } else if (type === 'cart') {
      // For cart bookings, use a mock session ID or handle differently
      fetchBookingDetails('cart_checkout_session');
    } else {
      console.error('No session_id found in URL');
      setError('No session ID found in URL. Please ensure you accessed this page from a valid checkout.');
      setLoading(false);
    }
  }, [router.isReady, session_id, type]);

  // Polling function to fetch booking details until booking is created by webhook
  const fetchBookingDetails = async (sessionId: string, retryCount = 0) => {
    try {
      const response = await fetch(`/api/booking/details?sessionId=${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch booking details");
      }

      // If booking is not found yet, retry (max 30 times, 2s interval)
      if (!data.booking && !data.bookings && retryCount < 30) {
        setTimeout(() => fetchBookingDetails(sessionId, retryCount + 1), 2000);
        return;
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
                
                {booking.isCartCheckout && booking.bookings ? (
                  // Cart checkout - multiple bookings
                  <div className="space-y-6">
                    {booking.bookings.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">Activity {index + 1}</p>
                            <p className="text-gray-600">{item.activity?.title || 'Activity'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">Participants</p>
                            <p className="text-gray-600">{item.participants} people</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">Amount</p>
                            <p className="text-gray-600">{formatCurrency(convert(item.amount, currency), currency)}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium">Booking ID: <span className="text-sm font-mono">{item.id}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : booking.booking ? (
                  // Single booking
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Activity</p>
                        <p className="text-gray-600">{booking.booking.activity?.title || 'Activity'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Participants</p>
                        <p className="text-gray-600">{booking.booking.participants} people</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Amount</p>
                        <p className="text-gray-600">{formatCurrency(convert(booking.booking.amount, currency), currency)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium">Booking ID: <span className="text-sm font-mono">{booking.booking.id}</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Booking details are being processed...</p>
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Total Amount</p>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(convert(booking.totalAmount, currency), currency)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {booking.customerName}</p>
                  <p><span className="font-medium">Email:</span> {booking.customerEmail}</p>
                  <p><span className="font-medium">Payment Status:</span> <span className="capitalize">{booking.paymentStatus}</span></p>
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
                <Button onClick={() => router.push("/profile?tab=bookings")} className="flex-1">
                  Manage My Bookings
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}