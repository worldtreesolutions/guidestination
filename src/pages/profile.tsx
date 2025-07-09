import Head from "next/head"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { User, Heart, Settings, Calendar, LogOut } from "lucide-react"
import customerService, { CustomerProfile, Booking, WishlistItem } from "@/services/customerService"
import ProfileEditForm from "@/components/profile/ProfileEditForm"
import BookingCard from "@/components/profile/BookingCard"
import WishlistCard from "@/components/profile/WishlistCard"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("overview")
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [profileData, bookingsData, wishlistData] = await Promise.all([
        customerService.getProfile(user.id),
        customerService.getBookings(user.id),
        customerService.getWishlist(user.id),
      ])
      setProfile(profileData)
      setBookings(bookingsData)
      setWishlist(wishlistData)
    } catch (error) {
      console.error("Failed to fetch profile ", error)
      toast({
        title: "Error",
        description: "Failed to load your profile data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    } else if (user) {
      fetchData()
    }
  }, [user, authLoading, router, fetchData])

  const handleProfileSave = async (updates: Partial<CustomerProfile>) => {
    if (!user) return
    setActionLoading(true)
    try {
      const updatedProfile = await customerService.updateProfile(user.id, updates)
      setProfile(updatedProfile)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      })
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (activityId: number) => {
    if (!user) return
    setActionLoading(true)
    try {
      await customerService.removeFromWishlist(user.id, activityId)
      setWishlist(wishlist.filter(item => item.activity_id !== activityId))
      toast({
        title: "Success",
        description: "Activity removed from your wishlist.",
      })
    } catch (error) {
      console.error("Failed to remove from wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to remove activity from wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleBookNow = (activityId: number) => {
    router.push(`/booking/${activityId}`)
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const totalSpent = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, booking) => sum + booking.total_amount, 0)

  return (
    <>
      <Head>
        <title>My Profile - Guidestination</title>
        <meta name="description" content="Manage your Guidestination profile and bookings" />
      </Head>

      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 text-white rounded-full p-4">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {profile?.first_name || profile?.last_name ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user.email}
                  </CardTitle>
                  <CardDescription>
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{bookings.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Wishlist Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{wishlist.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">฿{totalSpent.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map((booking) => (
                        <BookingCard key={booking.id} booking={booking} onViewDetails={(id) => console.log(id)} />
                      ))}
                    </div>
                  ) : (
                    <p>You have no recent bookings.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>View and manage your activity bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {bookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} onViewDetails={(id) => console.log(id)} />
                      ))}
                    </div>
                  ) : (
                    <p>You haven't made any bookings yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                  <CardDescription>Activities you want to book later</CardDescription>
                </CardHeader>
                <CardContent>
                  {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlist.map((item) => (
                        <WishlistCard 
                          key={item.id} 
                          item={item} 
                          onRemove={handleRemoveFromWishlist}
                          onBookNow={handleBookNow}
                          loading={actionLoading}
                        />
                      ))}
                    </div>
                  ) : (
                    <p>Your wishlist is empty. Start exploring to add activities!</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              {isEditing ? (
                <ProfileEditForm 
                  profile={profile} 
                  onSave={handleProfileSave} 
                  onCancel={() => setIsEditing(false)}
                  loading={actionLoading}
                />
              ) : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Manage your account preferences</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <p className="text-gray-800">{profile?.first_name || "Not set"}</p>
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <p className="text-gray-800">{profile?.last_name || "Not set"}</p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p className="text-gray-800">{user.email}</p>
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <p className="text-gray-800">{profile?.phone || "Not set"}</p>
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        <p className="text-gray-800">{profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "Not set"}</p>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </>
  )
}
