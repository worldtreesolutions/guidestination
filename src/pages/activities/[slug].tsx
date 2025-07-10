import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Image from "next/image"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { 
  Heart, 
  Share2, 
  Clock, 
  Users, 
  Globe, 
  MapPin, 
  Star, 
  CheckCircle, 
  XCircle,
  Calendar,
  MessageCircle
} from "lucide-react"
import { ActivityGallery } from "@/components/activities/ActivityGallery"
import { AvailabilityCalendar } from "@/components/activities/AvailabilityCalendar"
import { BookingForm } from "@/components/activities/BookingForm"
import { ActivityReviews } from "@/components/activities/ActivityReviews"
import { useIsMobile } from "@/hooks/use-mobile"
import { supabaseActivityService } from "@/services/supabaseActivityService"
import customerService from "@/services/customerService"
import { SupabaseActivity } from "@/types/activity"

export default function ActivityPage() {
  const router = useRouter()
  const { slug } = router.query
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [activity, setActivity] = useState<SupabaseActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedParticipants, setSelectedParticipants] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const isMobile = useIsMobile()

  const fetchActivity = useCallback(async () => {
    if (!slug || typeof slug !== "string") return
    
    try {
      setLoading(true)
      const activityData = await supabaseActivityService.getActivityById(slug)
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
  }, [slug, toast])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  const checkWishlistStatus = useCallback(async () => {
    if (!user || !activity) return
    try {
      const wishlist = await customerService.getWishlist(user.id)
      setIsInWishlist(wishlist.some(item => item.activity_id === Number(activity.id)))
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
        await customerService.removeFromWishlist(user.id, Number(activity.id))
        setIsInWishlist(false)
        toast({
          title: "Removed from wishlist",
          description: "Activity removed from your wishlist.",
        })
      } else {
        await customerService.addToWishlist(user.id, Number(activity.id))
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
    // TODO: Implement chat functionality
    toast({
      title: "Coming Soon",
      description: "Chat functionality will be available soon.",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: activity?.title,
          text: activity?.description || "",
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Activity link copied to clipboard.",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading activity details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Activity Not Found</h1>
            <p className="text-muted-foreground mb-4">The activity you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/")}>Back to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const formatPrice = (price: number | null) => {
    if (!price) return "Free"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDuration = (duration: number | null) => {
    if (duration === null) return ""
    const durationMap: { [key: number]: string } = {
      2: "2 hours",
      4: "Half day (4-5 hours)",
      8: "Full day (8-9 hours)",
    }
    return durationMap[duration] || `${duration} hours`
  }

  return (
    <>
      <Head>
        <title>{activity.title} - Guidestination</title>
        <meta name="description" content={activity.description || ""} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta property="og:image" content={activity.image_urls?.[0] || "/placeholder.jpg"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={activity.title} />
        <meta name="twitter:description" content={activity.description || ""} />
        <meta name="twitter:image" content={activity.image_urls?.[0] || "/placeholder.jpg"} />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="container py-4 sm:py-8 px-4 sm:px-6 max-w-7xl">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="capitalize">
                  {activity.category_name}
                </Badge>
                {activity.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{activity.rating}</span>
                    <span className="text-muted-foreground">
                      ({activity.review_count} reviews)
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                {activity.title || activity.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm sm:text-base">{activity.location || "Location TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{formatDuration(activity.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm sm:text-base">Max {activity.max_participants || 10} people</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{activity.languages?.join(", ") || "English"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {formatPrice(activity.price)}
                  </span>
                  <span className="text-muted-foreground">per person</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={handleChatWithOwner}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Image Gallery */}
                <ActivityGallery 
                  images={activity.image_urls || []}
                  videos={[]}
                  title={activity.title}
                />

                {/* Tabs Content */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="itinerary">Details</TabsTrigger>
                    <TabsTrigger value="included">Included</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>About This Experience</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {activity.description}
                        </p>
                      </CardContent>
                    </Card>

                    {activity.highlights && Array.isArray(activity.highlights) && activity.highlights.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Highlights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {activity.highlights.map((highlight, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="itinerary" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Meeting Point</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <span>{activity.meeting_point || "Meeting point TBD"}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {activity.includes_pickup && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Pickup Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Hotel pickup included</p>
                              <p className="text-muted-foreground text-sm">
                                {activity.pickup_locations || "Pickup details TBD"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {activity.includes_meal && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Meals</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Meal included</p>
                              <p className="text-muted-foreground text-sm">
                                {activity.meal_description || "Meal details TBD"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {activity.languages && Array.isArray(activity.languages) && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Languages</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2 flex-wrap">
                            {activity.languages.map((language: string, index: number) => (
                              <Badge key={index} variant="outline">{language}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="included" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {activity.included && Array.isArray(activity.included) && activity.included.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-green-600">What's Included</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {activity.included.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
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
                              {activity.not_included.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews">
                    <ActivityReviews 
                      activityId={activity.id.toString()}
                      rating={activity.rating || 0}
                      reviewCount={activity.review_count || 0}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Booking Sidebar */}
              <div className="lg:col-span-1">
                <div className={isMobile ? "mt-6" : "sticky top-20"}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Book This Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(activity.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">per person</div>
                      </div>

                      <Separator />

                      <AvailabilityCalendar
                        availableDates={activity.schedules?.availableDates?.map((d: any) => d.date) || []}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                      />

                      <BookingForm
                        activity={activity}
                        selectedDate={selectedDate}
                        participants={selectedParticipants}
                        onParticipantsChange={setSelectedParticipants}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
