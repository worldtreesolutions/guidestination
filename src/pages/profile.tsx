
import Head from "next/head"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Heart, ShoppingBag, Settings, Calendar } from "lucide-react"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
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

  const mockBookings = [
    {
      id: 1,
      activity: "Doi Suthep Temple Tour",
      date: "2024-01-15",
      status: "completed",
      price: 1800
    },
    {
      id: 2,
      activity: "Thai Cooking Class",
      date: "2024-01-20",
      status: "upcoming",
      price: 1440
    }
  ]

  const mockWishlist = [
    {
      id: 1,
      activity: "Elephant Nature Park",
      price: 3000,
      image: "https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5"
    },
    {
      id: 2,
      activity: "White Water Rafting",
      price: 2500,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5"
    }
  ]

  return (
    <>
      <Head>
        <title>My Profile - Guidestination</title>
        <meta name="description" content="Manage your Guidestination profile and bookings" />
      </Head>

      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 text-white rounded-full p-4">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {user.user_metadata?.full_name || user.email}
                  </CardTitle>
                  <CardDescription>
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Wishlist
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {mockBookings.length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Wishlist Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {mockWishlist.length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      ฿{mockBookings.reduce((sum, booking) => sum + booking.price, 0).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{booking.activity}</h4>
                          <p className="text-sm text-gray-600">{booking.date}</p>
                        </div>
                        <Badge variant={booking.status === "completed" ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>View and manage your activity bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{booking.activity}</h4>
                          <p className="text-sm text-gray-600">Date: {booking.date}</p>
                          <p className="text-sm font-medium">฿{booking.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={booking.status === "completed" ? "default" : "secondary"}>
                            {booking.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                  <CardDescription>Activities you want to book later</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockWishlist.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="aspect-video bg-gray-200 rounded-lg mb-3"></div>
                        <h4 className="font-medium">{item.activity}</h4>
                        <p className="text-lg font-bold text-blue-600">฿{item.price.toLocaleString()}</p>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" className="flex-1">
                            Book Now
                          </Button>
                          <Button variant="outline" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <p className="text-gray-600">{user.user_metadata?.full_name || "Not set"}</p>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline">
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </>
  )
}
