import Head from "next/head"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  MessageCircle, 
  Calendar,
  CheckCircle,
  XCircle,
  Phone,
  Mail
} from "lucide-react"
import { supabaseActivityService, SupabaseActivity } from "@/services/supabaseActivityService"
import customerService from "@/services/customerService"
import Image from "next/image"
import ActivitySchedule from "@/components/activities/ActivitySchedule"
import ChatModal from "@/components/activities/ChatModal"

export default function ActivityDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [activity, setActivity] = useState<SupabaseActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const fetchActivity = useCallback(async (activityId: number) => {
    try {
      setLoading(true)
      const activityData = await supabaseActivityService.getActivityById(activityId)
      if (!activityData) {
        router.push("/404")
        return
      }
      setActivity(activityData)
    } catch (error) {
      console.error("Error fetching activity:", error)
      toast({
        title: "Error",
        description: "Failed to load activity details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [router, toast])

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchActivity(parseInt(id))
    }
  }, [id, fetchActivity])

  const checkWishlistStatus = useCallback(async () => {
    if (!user || !activity) return
    try {
      const wishlist = await customerService.getWishlist(user.id)
      setIsInWishlist(wishlist.some(item => item.activity_id === activity.id))
    } catch (error) {
      console.error("Error checking wishlist status:", error)
    }
  }, [user, activity])

  useEffect(() => {
    if (user && activity) {
      checkWishlistStatus()
    }
  }, [user, activity, checkWishlistStatus])

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add activities to your wishlist.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!user || !activity) return

    setWishlistLoading(true)
    try {
      if (isInWishlist) {
        await customerService.removeFromWishlist(user.id, activity.id)
        setIsInWishlist(false)
        toast({
          title: "Removed from wishlist",
          description: "Activity removed from your wishlist.",
        })
      } else {
        await customerService.addToWishlist(user.id, activity.id)
        setIsInWishlist(true)
        toast({
          title: "Added to wishlist",
          description: "Activity added to your wishlist.",
        })
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book activities.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }
    router.push(`/booking/${activity?.id}`)
  }

  const handleChatWithOwner = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to chat with activity owners.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }
    setIsChatOpen(true)
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Activity - Guidestination</title>
        </Head>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading activity details...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!activity) {
    return null
  }

  return (
    <>
      <Head>
        <title>{activity.title} - Guidestination</title>
        <meta name="description" content={activity.description || ""} />
      </Head>

      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Activity Header */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="relative aspect-video">
              <Image
                src={activity.image_url || "https://images.unsplash.com/photo-1563492065599-3520f775eeed"}
                alt={activity.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{activity.title}</h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{activity.location || activity.pickup_location || "Location TBD"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{activity.duration || "Duration TBD"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Max {activity.max_participants || "N/A"} participants</span>
                    </div>
                    {activity.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{activity.rating}</span>
                        {activity.review_count && (
                          <span className="text-gray-500">({activity.review_count} reviews)</span>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="mb-4">
                    {activity.category || "General"}
                  </Badge>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    ฿{(activity.price || 0).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleWishlistToggle}
                      disabled={wishlistLoading}
                      className="flex items-center gap-2"
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                      {isInWishlist ? "Saved" : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleChatWithOwner}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </Button>
                    <Button onClick={handleBookNow} size="sm">
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Details Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{activity.description || "No description available."}</p>
                </CardContent>
              </Card>

              {activity.highlights && Array.isArray(activity.highlights) && activity.highlights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {activity.highlights.map((highlight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="schedule">
              <ActivitySchedule activity={activity} />
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activity.included && Array.isArray(activity.included) && activity.included.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">What's Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {activity.included.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {activity.not_included && Array.isArray(activity.not_included) && activity.not_included.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">What's Not Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {activity.not_included.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Meeting Point</h4>
                    <p className="text-gray-600">{activity.meeting_point || "To be confirmed"}</p>
                  </div>
                  
                  {activity.includes_pickup && (
                    <div>
                      <h4 className="font-medium mb-2">Pickup Information</h4>
                      <p className="text-gray-600">{activity.pickup_location || "Pickup details to be confirmed"}</p>
                    </div>
                  )}

                  {activity.includes_meal && activity.meal_description && (
                    <div>
                      <h4 className="font-medium mb-2">Meal Information</h4>
                      <p className="text-gray-600">{activity.meal_description}</p>
                    </div>
                  )}

                  {activity.languages && Array.isArray(activity.languages) && (
                    <div>
                      <h4 className="font-medium mb-2">Languages</h4>
                      <div className="flex gap-2">
                        {activity.languages.map((language: string, index: number) => (
                          <Badge key={index} variant="outline">{language}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Activity Owner</CardTitle>
                  <CardDescription>
                    Get in touch with the activity provider for questions or special requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activity.activity_owners && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Business Name</h4>
                        <p className="text-gray-600">{activity.activity_owners.business_name}</p>
                      </div>
                      
                      <div className="flex gap-4">
                        {activity.activity_owners.contact_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-600">{activity.activity_owners.contact_email}</span>
                          </div>
                        )}
                        
                        {activity.activity_owners.contact_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-600">{activity.activity_owners.contact_phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button onClick={handleChatWithOwner} className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Start Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Chat Modal */}
      {activity && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          activity={activity}
          currentUser={user}
        />
      )}

      <Footer />
    </>
  )
}
