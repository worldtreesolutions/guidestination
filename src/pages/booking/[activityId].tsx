import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Image from "next/image"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
  Play,
  ArrowLeft
} from "lucide-react"
import { ActivityGallery } from "@/components/activities/ActivityGallery"
import { AvailabilityCalendar } from "@/components/activities/AvailabilityCalendar"
import { BookingForm } from "@/components/activities/BookingForm"
import { ActivityReviews } from "@/components/activities/ActivityReviews"
import { useIsMobile } from "@/hooks/use-mobile"
import { supabaseActivityService } from "@/services/supabaseActivityService"
import { SupabaseActivity } from "@/types/activity"

export default function ActivityBookingPage() {
  const router = useRouter()
  const { activityId } = router.query
  const [activity, setActivity] = useState<SupabaseActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedParticipants, setSelectedParticipants] = useState(1)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const fetchActivity = async () => {
      if (!activityId || typeof activityId !== "string") return
      
      try {
        setLoading(true)
        const activityData = await supabaseActivityService.getActivityById(parseInt(activityId as string))
        setActivity(activityData)
      } catch (error) {
        console.error("Error fetching activity:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [activityId])

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
    if (duration === null) return "";
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
        <title>Book {activity.title} - Guidestination</title>
        <meta name="description" content={`Book ${activity.title} - ${activity.description}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="container py-4 sm:py-8 px-4 sm:px-6 max-w-7xl">
            {/* Back Button */}
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Activity
              </Button>
            </div>

            {/* Header Section */}
            <div className="mb-8">
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
                Book: {activity.title || activity.name}
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Image Gallery */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityGallery 
                      images={activity.image_urls || []}
                      videos={[]}
                      title={activity.title}
                    />
                  </CardContent>
                </Card>

                {/* Activity Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>About This Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {activity.description}
                    </p>

                    {activity.highlights && activity.highlights.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Highlights</h3>
                        <ul className="space-y-2">
                          {activity.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* What's Included/Not Included */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">What's Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(activity.included || []).map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">What's Not Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(activity.not_included || []).map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Meeting Point */}
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Point & Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Meeting Point</p>
                        <p className="text-muted-foreground">{activity.meeting_point || "Meeting point TBD"}</p>
                      </div>
                    </div>

                    {activity.includes_pickup && (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Hotel pickup included</p>
                          <p className="text-muted-foreground text-sm">
                            {activity.pickup_locations || "Pickup details TBD"}
                          </p>
                        </div>
                      </div>
                    )}

                    {activity.includes_meal && (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Meal included</p>
                          <p className="text-muted-foreground text-sm">
                            {activity.meal_description || "Meal details TBD"}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Reviews Section */}
                <ActivityReviews 
                  activityId={activity.id.toString()}
                  rating={activity.rating || 0}
                  reviewCount={activity.review_count || 0}
                />
              </div>

              {/* Booking Sidebar */}
              <div className="lg:col-span-1">
                <div className={isMobile ? "mt-6" : "sticky top-20"}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Complete Your Booking
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

                      <div>
                        <h3 className="font-semibold mb-3">Select Date</h3>
                        <AvailabilityCalendar
                          availableDates={activity.schedules?.availableDates?.map((d: any) => d.date) || []}
                          selectedDate={selectedDate}
                          onDateSelect={setSelectedDate}
                        />
                      </div>

                      <Separator />

                      <BookingForm
                        activity={activity}
                        selectedDate={selectedDate}
                        participants={selectedParticipants}
                        onParticipantsChange={setSelectedParticipants}
                      />
                    </CardContent>
                  </Card>

                  {/* Trust & Safety */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-sm">Trust & Safety</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Verified activity provider</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Secure payment processing</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>24/7 customer support</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Free cancellation available</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Activity Details</h2>
          {activity.highlights && activity.highlights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Highlights</h3>
              <ul className="list-disc list-inside space-y-1">
                {activity.highlights.map((highlight: string, index: number) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">What's Included</h3>
            <ul className="list-disc list-inside space-y-1">
              {activity.included?.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">What's Not Included</h3>
            <ul className="list-disc list-inside space-y-1">
              {activity.not_included?.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {activity.meeting_point && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Meeting Point</h3>
              <p>{activity.meeting_point}</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Schedule</h2>
          {activity.schedules && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Start Time</h3>
                <p>{activity.schedules?.availableDates[0]?.startTime || "Not specified"}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">End Time</h3>
                <p>{activity.schedules?.availableDates[0]?.endTime || "Not specified"}</p>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  )
}
