import Head from "next/head"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileEditForm } from "@/components/profile/ProfileEditForm"
import { BookingCard } from "@/components/profile/BookingCard"
import { WishlistCard } from "@/components/profile/WishlistCard"
import { BookingDetailsModal } from "@/components/profile/BookingDetailsModal"
import { supabase } from "@/integrations/supabase/client"
import { Booking, Activity } from "@/types/activity"

interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  date_of_birth?: string
  avatar_url?: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [wishlist, setWishlist] = useState<Activity[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data || {
          id: user.id,
          email: user.email || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
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
            meeting_point
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching bookings:', error)
      } else {
        setBookings(data || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }, [user])

  const fetchWishlist = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          activities (
            id,
            title,
            description,
            image_url,
            b_price,
            meeting_point,
            average_rating
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching wishlist:', error)
      } else {
        const activities = data?.map(item => item.activities).filter(Boolean) || []
        setWishlist(activities as Activity[])
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchProfile(),
        fetchBookings(),
        fetchWishlist()
      ]).finally(() => setLoading(false))
    }
  }, [user, fetchProfile, fetchBookings, fetchWishlist])

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
  }

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
  }

  const handleRemoveFromWishlist = async (activityId: number) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('activity_id', activityId)

      if (error) {
        console.error('Error removing from wishlist:', error)
      } else {
        setWishlist(prev => prev.filter(activity => activity.id !== activityId))
      }
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
            <p>Please log in to view your profile.</p>
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
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile && (
                    <ProfileEditForm
                      profile={profile}
                      onUpdate={handleProfileUpdate}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.length > 0 ? (
                    <div className="grid gap-4">
                      {bookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          onClick={() => handleBookingClick(booking)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No bookings found.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                  {wishlist.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {wishlist.map((activity) => (
                        <WishlistCard
                          key={activity.id}
                          activity={activity}
                          onRemove={() => handleRemoveFromWishlist(activity.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No items in wishlist.
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
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  )
}
