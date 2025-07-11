import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ActivityDetails } from "@/components/activities/ActivityDetails";
import { ActivityGallery } from "@/components/activities/ActivityGallery";
import { ActivityReviews } from "@/components/activities/ActivityReviews";
import { BookingWidget } from "@/components/activities/BookingWidget";
import { AvailabilityCalendar } from "@/components/activities/AvailabilityCalendar";
import { Activity, ActivityScheduleInstance } from "@/types/activity";
import activityService from "@/services/activityService";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Star, Shield, Utensils, Car } from "lucide-react";

export default function ActivityPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [scheduleData, setScheduleData] = useState<ActivityScheduleInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (typeof slug !== "string") {
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await activityService.getActivityBySlug(slug);
        if (data) {
          setActivity(data);
          // Fetch schedule data for this activity
          const schedules = await activityService.getActivitySchedules(data.id);
          setScheduleData(schedules);
        } else {
          setError("Activity not found.");
        }
      } catch (err) {
        setError("Failed to load activity details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchActivity();
    }
  }, [slug]);

  const renderLoading = () => (
    <div className="container py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );

  const renderError = () => (
    <div className="container py-8 text-center">
      <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
      <p>{error}</p>
    </div>
  );

  const renderContent = () => {
    if (!activity) return null;

    const images = activity.image_url ? activity.image_url.split(",").map(s => s.trim()) : [];
    const videos = activity.video_url ? activity.video_url.split(",").map(s => s.trim()) : [];

    return (
      <div className="container py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Activity Gallery */}
          {images.length > 0 && (
            <ActivityGallery images={images} videos={videos} title={activity.title} />
          )}

          {/* Activity Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{activity.category}</Badge>
              {activity.average_rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{activity.average_rating}</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold">{activity.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{activity.address}</span>
              </div>
              {activity.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{activity.duration}</span>
                </div>
              )}
              {activity.max_participants && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Up to {activity.max_participants} people</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Details */}
          <ActivityDetails activity={activity} />

          {/* What's Included */}
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activity.includes_pickup && (
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Hotel pickup included</span>
                  </div>
                )}
                {activity.includes_meal && (
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Meal included</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Professional guide</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Safety equipment</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Requirements */}
          {(activity.min_age || activity.max_age || activity.technical_skill_level || activity.physical_effort_level) && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements & Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(activity.min_age || activity.max_age) && (
                    <div>
                      <h4 className="font-medium mb-2">Age Requirements</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.min_age && activity.max_age 
                          ? `Ages ${activity.min_age} - ${activity.max_age}`
                          : activity.min_age 
                          ? `Minimum age: ${activity.min_age}`
                          : `Maximum age: ${activity.max_age}`
                        }
                      </p>
                    </div>
                  )}
                  {activity.technical_skill_level && (
                    <div>
                      <h4 className="font-medium mb-2">Technical Skill Level</h4>
                      <Badge variant="outline">{activity.technical_skill_level}</Badge>
                    </div>
                  )}
                  {activity.physical_effort_level && (
                    <div>
                      <h4 className="font-medium mb-2">Physical Effort Level</h4>
                      <Badge variant="outline">{activity.physical_effort_level}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Reviews */}
          <ActivityReviews 
            activityId={activity.id} 
            rating={activity.average_rating || 0}
            reviewCount={0}
          />
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Availability Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <AvailabilityCalendar 
                activityId={activity.id} 
                scheduleData={scheduleData}
              />
            </CardContent>
          </Card>

          {/* Booking Widget */}
          <Card>
            <CardContent className="p-0">
              <BookingWidget activity={activity} />
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="text-sm font-medium">{activity.duration || "Varies"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Group Size</span>
                <span className="text-sm font-medium">
                  {activity.max_participants ? `Up to ${activity.max_participants}` : "Varies"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Language</span>
                <span className="text-sm font-medium">English, Thai</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cancellation</span>
                <span className="text-sm font-medium">Free up to 24h</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {loading ? renderLoading() : error ? renderError() : renderContent()}
      </main>
      <Footer />
    </div>
  );
}
