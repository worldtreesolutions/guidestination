import { useEffect, useState } from "react";
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, CartItem } from "@/contexts/CartContext";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Calendar, ArrowLeft, CreditCard, Shield, Star } from "lucide-react";
import { ActivityWithDetails, ActivityScheduleInstance } from "@/types/activity";
import activityService from "@/services/activityService";
import { supabase } from "@/integrations/supabase/client";

interface BookingData {
  activityId: number;
  scheduleId: number;
  quantity: number;
}

interface CheckoutData {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  timestamp: string;
}

export default function CheckoutSummary() {
  const { currency, convert } = useCurrency();
  const router = useRouter();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [cartData, setCartData] = useState<CheckoutData | null>(null);
  const [activity, setActivity] = useState<ActivityWithDetails | null>(null);
  const [schedule, setSchedule] = useState<ActivityScheduleInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: ""
  });

  useEffect(() => {
    // Check for cart checkout data first
    const savedCheckoutData = localStorage.getItem('checkout-data');
    if (savedCheckoutData) {
      try {
        const parsedData = JSON.parse(savedCheckoutData);
        setCartData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing checkout data:', error);
      }
    } else {
      // Fallback to single booking data from query parameters
      const { activityId, scheduleId, quantity } = router.query;
      
      if (activityId && scheduleId && quantity) {
        setBookingData({
          activityId: parseInt(activityId as string),
          scheduleId: parseInt(scheduleId as string),
          quantity: parseInt(quantity as string)
        });
      }
    }

    // Pre-fill customer info if user is logged in
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        firstName: user.user_metadata?.firstName || "",
        lastName: user.user_metadata?.lastName || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || ""
      }));
    }
  }, [router.query, user]);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingData) return;

      try {
        setLoading(true);

        // Fetch activity details
        const activityData = await activityService.getActivityById(bookingData.activityId);
        setActivity(activityData);

        // Fetch schedule details
        const { data: scheduleData, error } = await supabase
          .from("activity_schedule_instances")
          .select("*")
          .eq("id", bookingData.scheduleId)
          .single();

        if (error) {
          console.error("Error fetching schedule:", error);
        } else {
          // Transform the data to match ActivityScheduleInstance type
          const transformedSchedule: ActivityScheduleInstance = {
            ...scheduleData,
            available_spots: scheduleData.capacity - scheduleData.booked_count,
            notes: null
          };
          setSchedule(transformedSchedule);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingData]);

  const handleGoToPayment = async () => {
    // Validate customer information
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (cartData) {
        // Handle cart checkout
        const cartCheckoutData = {
          items: cartData.items.map(item => ({
            activityId: item.activity.id,
            scheduleId: item.schedule.id,
            quantity: item.quantity,
            providerId: item.activity.provider_id,
            title: item.activity.title,
            price: item.schedule.price_override || item.activity.final_price ||  0,
            // ...existing code...
          })),
          totalAmount: Math.ceil(cartData.totalPrice),
          currency: "thb", // Default to THB, could be made dynamic
          successUrl: `${window.location.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}&type=cart`,
          cancelUrl: `${window.location.origin}/checkout/summary`,
          customerId: user?.id,
          commissionPercent: 20,
          customerInfo: customerInfo,
          isCartCheckout: true
        };

        const response = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cartCheckoutData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create checkout session");
        }

        const result = await response.json();
        
        if (result.url) {
          // Clear cart and checkout data on successful payment initiation
          clearCart();
          localStorage.removeItem('checkout-data');
          window.location.href = result.url;
        } else {
          throw new Error("No checkout URL received");
        }
        return;
      }

      if (!bookingData || !activity || !schedule) return;

      // Handle single booking checkout
      const price = schedule.price_override || activity.final_price || activity.b_price || 0;
      const totalAmount = Math.ceil(price * bookingData.quantity);

      // Create checkout data for Stripe
      const checkoutData = {
        activityId: activity.id,
        providerId: activity.provider_id ,
        participants: bookingData.quantity,
        amount: totalAmount,
        currency: activity.currency_code?.toLowerCase() || "thb",
        successUrl: `${window.location.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}&activity_id=${activity.id}&schedule_id=${schedule.id}`,
        cancelUrl: `${window.location.origin}/checkout/summary?activityId=${bookingData.activityId}&scheduleId=${bookingData.scheduleId}&quantity=${bookingData.quantity}`,
        customerId: user?.id,
        commissionPercent: 20,
        customerInfo: customerInfo
      };

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const result = await response.json();
      
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert(`Failed to proceed to payment: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const getTotalPrice = () => {
    if (cartData) {
      return Math.ceil(cartData.totalPrice);
    }
    if (!activity || !schedule || !bookingData) return 0;
    const price = schedule.price_override || activity.final_price || activity.b_price || 0;
    return Math.ceil(price * bookingData.quantity);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 font-medium">Loading booking details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If neither cart data nor single booking data is available
  if (!cartData && (!bookingData || !activity || !schedule)) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Booking Not Found</h1>
            <p className="text-gray-600 mb-8 text-lg">We couldn't find the booking details.</p>
            <Button onClick={() => router.push('/')} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Go Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 hover:bg-white/50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {cartData ? 'Complete Your Cart Checkout' : 'Complete Your Booking'}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {cartData 
                  ? `Review your ${cartData.totalItems} item${cartData.totalItems === 1 ? '' : 's'} and provide your information`
                  : 'Review your order details and provide your information to secure your adventure'
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="xl:col-span-2">
              <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Calendar className="h-6 w-6" />
                    {cartData ? 'Your Cart Summary' : 'Your Adventure Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {cartData ? (
                    /* Cart Items Display */
                    <div className="space-y-6">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          Review Your Cart ({cartData.totalItems} item{cartData.totalItems === 1 ? '' : 's'})
                        </h2>
                      </div>
                      
                      {/* Cart Items List */}
                      <div className="space-y-4">
                        {cartData.items.map((item, index) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.activity.title}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <span>{new Date(item.schedule.scheduled_date).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-green-600" />
                                    <span>{item.schedule.start_time} - {item.schedule.end_time}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-purple-600" />
                                    <span>{item.quantity} {item.quantity === 1 ? 'person' : 'people'}</span>
                                  </div>
                                </div>
                                {item.activity.location && (
                                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 text-orange-600" />
                                    <span>{item.activity.location}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(
                                    convert(
                                      (item.schedule.price_override || item.activity.final_price || item.activity.b_price || 0) * item.quantity,
                                      currency
                                    ),
                                    currency
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatCurrency(
                                    convert(
                                      item.schedule.price_override || item.activity.final_price || item.activity.b_price || 0,
                                      currency
                                    ),
                                    currency
                                  )} × {item.quantity}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="bg-gray-200" />

                      {/* Cart Summary */}
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cart Summary</h3>
                        <div className="space-y-3">
                          {cartData.items.map((item, index) => (
                            <div key={item.id} className="flex justify-between items-center text-gray-700">
                              <span className="truncate">{item.activity.title} (×{item.quantity})</span>
                              <span className="font-medium">{formatCurrency(
                                convert(
                                  (item.schedule.price_override || item.activity.final_price || item.activity.b_price || 0) * item.quantity,
                                  currency
                                ),
                                currency
                              )}</span>
                            </div>
                          ))}
                          <Separator className="bg-gray-300" />
                          <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                            <span>Total Amount</span>
                            <span className="text-blue-600">{formatCurrency(
                              convert(getTotalPrice(), currency),
                              currency
                            )}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Single Activity Display */
                    <>
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{activity?.title}</h2>
                            <p className="text-gray-600 leading-relaxed">{activity?.description}</p>
                          </div>
                          <Badge variant="secondary" className="ml-4 bg-green-100 text-green-800 border-green-200">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      </div>

                      <Separator className="bg-gray-200" />

                      {/* Booking Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">Date</p>
                              <p className="text-blue-700 font-semibold">
                                {schedule && new Date(schedule.scheduled_date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                            <Clock className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-900">Time</p>
                              <p className="text-green-700 font-semibold">{schedule?.start_time} - {schedule?.end_time}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <Users className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-purple-900">Participants</p>
                              <p className="text-purple-700 font-semibold">{bookingData?.quantity} {bookingData?.quantity === 1 ? 'person' : 'people'}</p>
                            </div>
                          </div>
                          
                          {activity?.location && (
                            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                              <MapPin className="h-5 w-5 text-orange-600" />
                              <div>
                                <p className="text-sm font-medium text-orange-900">Location</p>
                                <p className="text-orange-700 font-semibold">{activity.location}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator className="bg-gray-200" />

                      {/* Price Breakdown */}
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-gray-700">
                            <span>Price per person</span>
                            <span className="font-medium">{formatCurrency(
                              convert(
                                schedule.price_override || activity.final_price || activity.b_price || 0,
                                currency
                              ),
                              currency
                            )}</span>
                          </div>
                          <div className="flex justify-between items-center text-gray-700">
                            <span>Number of participants</span>
                            <span className="font-medium">× {bookingData.quantity}</span>
                          </div>
                          <Separator className="bg-gray-300" />
                          <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                            <span>Total Amount</span>
                            <span className="text-blue-600">{formatCurrency(
                              convert(getTotalPrice(), currency),
                              currency
                            )}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Customer Information */}
            <div className="xl:col-span-1">
              <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm sticky top-4">
                <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                  <CardTitle className="text-xl">Your Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name *</Label>
                      <Input
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialRequests" className="text-sm font-semibold text-gray-700">Special Requests</Label>
                      <Input
                        id="specialRequests"
                        value={customerInfo.specialRequests}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, specialRequests: e.target.value }))}
                        placeholder="Any special requirements?"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(
                        convert(getTotalPrice(), currency),
                        currency
                      )}</span>
                    </div>
                    
                    <Button 
                      onClick={handleGoToPayment}
                      className="w-full bg-blue-600 hover:bg-blue-700 font-semibold py-3"
                      size="lg"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Payment
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Shield className="h-4 w-4" />
                      <span>Secure payment powered by Stripe</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
