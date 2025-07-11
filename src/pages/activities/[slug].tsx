import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ActivityDetails } from "@/components/activities/ActivityDetails";
import { ActivityGallery } from "@/components/activities/ActivityGallery";
import { ActivityReviews } from "@/components/activities/ActivityReviews";
import { BookingWidget } from "@/components/activities/BookingWidget";
import { AvailabilityCalendar } from "@/components/activities/AvailabilityCalendar";
import { ActivityWithDetails, ActivitySchedule } from "@/types/activity";
import activityService from "@/services/activityService";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Users, Star, Shield, Utensils, Car } from "lucide-react";

export default function ActivityPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [activity, setActivity] = useState<ActivityWithDetails | null>(null);
  const [scheduleData, setScheduleData] = useState<ActivitySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (typeof slug !== "string") return;
      try {
        setLoading(true);
        const activityData = await activityService.getActivityBySlug(slug);
        setActivity(activityData);
      } catch (error) {
        console.error("Error fetching activity:", error);
        setError("Failed to load activity details.");
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
    if (!activity) {
      return <div>Activity not found</div>;
    }

    const images = activity.image_url ? [activity.image_url] : (activity.image_urls || []);

    return (
      <div className="bg-white text-black">
        <div className="container py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ActivityGallery images={images} title={activity.title} videos={[]} />
            <ActivityDetails activity={activity} />
            <ActivityReviews reviews={activity.reviews || []} />
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <AvailabilityCalendar 
                  activityId={String(activity.id)} 
                  scheduleData={scheduleData}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-0">
                <BookingWidget activity={activity} />
              </CardContent>
            </Card>
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
                {activity.languages && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Language</span>
                    <span className="text-sm font-medium">{activity.languages}</span>
                  </div>
                )}
                {activity.cancellation_policy && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cancellation</span>
                    <span className="text-sm font-medium">{activity.cancellation_policy}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? renderLoading() : error ? renderError() : renderContent()}
      </main>
      <Footer />
    </div>
  );
}
