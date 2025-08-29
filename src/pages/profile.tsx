import Head from "next/head"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import Navbar from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileEditForm from "@/components/profile/ProfileEditForm"
import BookingCard from "@/components/profile/BookingCard"
import BookingDetailsModal from "@/components/profile/BookingDetailsModal"
import { supabase } from "@/integrations/supabase/client"
import { Booking, Activity } from "@/types/activity"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import customerService, { Customer } from "@/services/customerService"
import { Heart, Trash2 } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [wishlist, setWishlist] = useState<Activity[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCustomer = useCallback(async () => {
    if (!user) return

    try {
      const customerData = await customerService.getCustomer(user.id);
      
      if (!customerData) {
        // Create customer record if it doesn't exist
        const userMetadata = user.user_metadata || {};
        const fullName = `${userMetadata.first_name || ''} ${userMetadata.last_name || ''}`.trim();
        
        const newCustomer = await customerService.createCustomer({
          cus_id: user.id,
          email: user.email || '',
          full_name: fullName || 'User',
          phone: userMetadata.phone || null,
          is_active: true
        });
        
        setCustomer(newCustomer);
      } else {
        setCustomer(customerData);
      }
    } catch (error) {
      console.error("Error fetching customer profile:", error);
    }
  }, [user])

  const fetchBookings = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          activities (
            title,
            image_url,
            meeting_point,
            pickup_location,
            provider_id
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching bookings:", error)
      } else {
        setBookings((data as Booking[]) || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    }
  }, [user])

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      console.log("fetchWishlist: No user logged in");
      return;
    }

    try {
      console.log("Fetching wishlist for user:", user.id);
      
      const wishlistItems = await customerService.getWishlist(user.id);
      console.log("Found", wishlistItems.length, "wishlist items");
      
      if (wishlistItems.length === 0) {
        setWishlist([]);
        return;
      }
      
      // Get activity details for each wishlist item
      const activities = [];
      for (const item of wishlistItems) {
        try {
          const { data: activity, error } = await supabase
            .from('activities')
            .select('id, title, description, image_url, final_price, b_price, meeting_point, average_rating, currency_code')
            .eq('id', item.activity_id)
            .single();
          
          if (error) {
            console.error(`Error fetching activity ${item.activity_id}:`, error);
          } else if (activity) {
            activities.push(activity);
          }
        } catch (err) {
          console.error(`Exception fetching activity ${item.activity_id}:`, err);
        }
      }
      
      console.log("Successfully loaded", activities.length, "activities for wishlist");
      setWishlist(activities as Activity[]);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }, [user])

  useEffect(() => {
    if (user) {
      console.log("Profile page: Loading data for user:", user.id);
      Promise.all([
        fetchCustomer(),
        fetchBookings(),
        fetchWishlist()
      ]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user, fetchCustomer, fetchBookings, fetchWishlist])

  // Refresh wishlist when page becomes visible (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log("Page became visible, refreshing wishlist")
        fetchWishlist()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, fetchWishlist])

  const handleCustomerUpdate = (updatedCustomer: Customer) => {
    setCustomer(updatedCustomer);
  }

  // Optimized: fetch owner details only when needed
  const handleBookingClick = async (booking: Booking) => {
    console.debug('[BookingDetails] Clicked booking:', booking);
    console.debug('[BookingDetails] booking.activities:', booking.activities);
    console.debug('[BookingDetails] booking.activities.provider_id:', booking.activities?.provider_id);
    if (!booking.activities?.provider_id) {
      console.warn('[BookingDetails] No provider_id found for activity:', booking.activities);
      setSelectedBooking(booking);
      return;
    }
    try {
      console.debug('[BookingDetails] Fetching owner for provider_id:', booking.activities.provider_id);
      const { data: owner, error } = await supabase
        .from('activity_owners')
        .select('business_name, email, phone')
        .eq('provider_id', booking.activities.provider_id)
        .single();
      console.debug('[BookingDetails] Owner fetch result:', { owner, error });
      if (!error && owner) {
        setSelectedBooking({
          ...booking,
          activities: {
            ...booking.activities,
            provider_name: owner.business_name || '',
            provider_email: owner.email || '',
            provider_phone: owner.phone || ''
          }
        });
      } else {
        console.warn('[BookingDetails] No owner found or error:', error);
        setSelectedBooking(booking);
      }
    } catch (err) {
      console.error('[BookingDetails] Exception fetching owner:', err);
      setSelectedBooking(booking);
    }
  }

  const handleRemoveFromWishlist = async (activityId: number) => {
    if (!user) return

    try {
      await customerService.removeFromWishlist(user.id, activityId)
      setWishlist(prev => prev.filter(activity => activity.id !== activityId))
      console.log(`Removed activity ${activityId} from wishlist`)
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>{t("profile.messages.loginRequired")}</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">{t("profile.messages.loading")}</div>
        </div>
      </div>
    )
  }

  return (      <div>
        <Head>
          <title>{t("profile.page.title")} - Guidestination</title>
          <style jsx>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </Head>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t("profile.page.title")}</h1>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">{t("profile.tabs.profile")}</TabsTrigger>
              <TabsTrigger value="bookings">{t("profile.tabs.bookings")}</TabsTrigger>
              <TabsTrigger value="wishlist">{t("profile.tabs.wishlist")}</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.section.profileInfo")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer && (
                    <ProfileEditForm
                      customer={customer}
                      onUpdate={handleCustomerUpdate}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.section.myBookings")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.length > 0 ? (
                    <div className="grid gap-4">
                      {bookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          onViewDetails={handleBookingClick}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      {t("profile.messages.noBookings")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist">
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.section.myWishlist")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {wishlist.map((activity) => (
                        <div key={activity.id} className="group cursor-pointer">
                          <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-[4/3] mb-3">
                            {activity.image_url ? (
                              <img
                                src={Array.isArray(activity.image_url) ? activity.image_url[0] : activity.image_url}
                                alt={activity.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                <span className="text-white text-lg font-semibold">
                                  {activity.title.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <button 
                                onClick={() => handleRemoveFromWishlist(activity.id)}
                                className="p-1.5 rounded-full shadow-md transition-colors bg-red-500 text-white hover:bg-red-600"
                                title={t("profile.messages.removeFromWishlist")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <Link href={`/activities/${'slug' in activity && activity.slug ? activity.slug : `activity-${activity.id}`}`}>
                            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {activity.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mb-2">{activity.meeting_point || t("profile.messages.locationNotSpecified")}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex items-center text-yellow-400 mr-1">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-600">{activity.average_rating || '4.5'}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-gray-900">
                                {(activity.final_price || activity.b_price) ? `${Math.ceil(activity.final_price || activity.b_price)} ${(activity as any).currency_code || 'THB'}` : t("profile.messages.priceTBA")}
                              </span>
                              {(activity.final_price || activity.b_price) && <span className="text-sm text-gray-500">{t("profile.messages.perPerson")}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      {t("profile.messages.noWishlist")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  )
}
