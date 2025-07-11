import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Users, 
  Globe, 
  MapPin, 
  Star, 
  CheckCircle, 
  XCircle,
  Calendar,
  ArrowLeft,
  Languages
} from "lucide-react";
import { ActivityGallery } from "@/components/activities/ActivityGallery";
import { AvailabilityCalendar } from "@/components/activities/AvailabilityCalendar";
import BookingForm from "@/components/activities/BookingForm";
import { ActivityReviews } from "@/components/activities/ActivityReviews";
import { useIsMobile } from "@/hooks/use-mobile";
import activityService from "@/services/activityService";
import { Activity, SupabaseActivity, ActivityWithDetails } from "@/types/activity";
import { Check, X } from "lucide-react";
import stripeService from "@/services/stripeService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function ActivityBookingPage() {
  const router = useRouter();
  const { activityId } = router.query;
  const [activity, setActivity] = useState<ActivityWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchActivity = async () => {
      if (typeof activityId !== "string") return;
      try {
        setLoading(true);
        const activityIdAsNumber = parseInt(activityId, 10);
        if (isNaN(activityIdAsNumber)) {
          throw new Error("Invalid activity ID");
        }
        const activityData = await activityService.getActivityById(activityIdAsNumber);
        setActivity(activityData);
      } catch (error) {
        console.error("Error fetching activity:", error);
        setError("Failed to load activity details.");
      } finally {
        setLoading(false);
      }
    };

    if (activityId) {
      fetchActivity();
    }
  }, [activityId]);

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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/")}>Back to Home</Button>
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

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "Free"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDuration = (duration: string | number | null | undefined) => {
    if (duration === null || duration === undefined) return "";
    const durationNum = typeof duration === 'string' ? parseInt(duration, 10) : duration;
    if (isNaN(durationNum)) return "";
    return `${durationNum} hours`;
  }

  const handlePayment = async () => {
    if (!selectedDate) {
      toast({
        title: "Select a date",
        description: "Please choose an available date before booking.",
        variant: "destructive",
      });
      return;
    }
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a booking.",
        variant: "destructive",
      });
      return;
    }

    try {
      const session = await stripeService.createCheckoutSession({
        activityId: activity.id.toString(),
        activityName: activity.name || activity.title,
        price: activity.b_price,
        participants: participants,
        selectedDate: selectedDate,
        userId: user.id,
        userEmail: user.email,
      });

      if (session.url) {
        router.push(session.url);
      } else {
        console.error("Failed to create checkout session");
        setError("Could not initiate booking. Please try again.");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

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

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="capitalize">
                  {activity.categories?.name || "Uncategorized"}
                </Badge>
                {activity.average_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{activity.average_rating.toFixed(1)}</span>
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
                  <span className="text-sm sm:text-base">{activity.meeting_point || "Location TBD"}</span>
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
                  <span className="text-sm sm:text-base">{Array.isArray(activity.languages) ? activity.languages.join(", ") : (activity.languages || "English")}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityGallery 
                      images={activity.image_url ? [activity.image_url] : []}
                      videos={activity.video_url ? [{url: activity.video_url, thumbnail: activity.video_thumbnail_url || undefined}] : []}
                      title={activity.title || ""}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>About This Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {activity.description}
                    </p>

                    {Array.isArray(activity.highlights) && activity.highlights.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-2">Highlights</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {activity.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">What's Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(activity.included) && activity.included.length > 0 && (
                        <div>
                          <ul className="space-y-2">
                            {activity.included.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">What's Not Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(activity.not_included) && activity.not_included.length > 0 && (
                        <div>
                          <ul className="space-y-2">
                            {activity.not_included.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

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

                {activity.activity_schedules && activity.activity_schedules.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {activity.activity_schedules.map((schedule, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>Day {schedule.day_of_week}</span>
                            <span>{schedule.start_time} - {schedule.end_time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <ActivityReviews reviews={activity.reviews || []} />
              </div>

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
                        <div className="text-4xl font-bold">
                          {activity.currency || "THB"}
                          {activity.b_price}
                        </div>
                        <div className="text-sm text-muted-foreground">per person</div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-3">Select Date</h3>
                        <AvailabilityCalendar
                          activityId={activity.id}
                          availableDates={activity.activity_schedules?.map((d: any) => d.scheduled_date) || []}
                          scheduleData={activity.activity_schedules || []}
                          selectedDate={selectedDate}
                          onDateSelect={setSelectedDate}
                        />
                      </div>

                      <Separator />

                      <BookingForm
                        activity={activity}
                        selectedDate={selectedDate}
                        participants={participants}
                        onParticipantsChange={setParticipants}
                        onDateChange={setSelectedDate}
                        onSubmit={handlePayment}
                      />
                    </CardContent>
                  </Card>

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
        <Footer />
      </div>
    </>
  )
}