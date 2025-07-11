import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ActivityDetails } from "@/components/activities/ActivityDetails";
import { ActivityGallery } from "@/components/activities/ActivityGallery";
import { ActivityReviews } from "@/components/activities/ActivityReviews";
import { BookingWidget } from "@/components/activities/BookingWidget";
import { AvailabilityCalendar } from "@/components/activities/AvailabilityCalendar";
import { ActivityChat } from "@/components/activities/ActivityChat";
import { ActivityWithDetails, ActivityScheduleInstance } from "@/types/activity";
import activityService from "@/services/activityService";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Star, Calendar, DollarSign, Shield, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, User } from "lucide-react";

export default function ActivityPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [activity, setActivity] = useState<ActivityWithDetails | null>(null);
  const [scheduleInstances, setScheduleInstances] = useState<ActivityScheduleInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityAndSchedules = async () => {
      if (typeof slug !== "string") return;
      try {
        setLoading(true);
        
        // Fetch activity details
        const activityData = await activityService.getActivityBySlug(slug);
        if (!activityData) {
          setError("Activity not found");
          return;
        }
        
        setActivity(activityData);

        // Fetch schedule instances for this activity
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("activity_schedule_instances")
          .select("*")
          .eq("activity_id", activityData.id)
          .eq("is_active", true)
          .gte("scheduled_date", new Date().toISOString().split('T')[0])
          .order("scheduled_date", { ascending: true });

        if (scheduleError) {
          console.error("Error fetching schedule instances:", scheduleError);
        } else {
          // Transform the data to match our type expectations
          const transformedScheduleData = (scheduleData || []).map(schedule => ({
            ...schedule,
            notes: schedule.notes || null,
            available_spots: schedule.capacity - schedule.booked_count,
            price: schedule.price_override || activityData.b_price || 0
          }));
          setScheduleInstances(transformedScheduleData);
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
        setError("Failed to load activity details.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchActivityAndSchedules();
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

  const renderActivityHeader = () => {
    if (!activity) return null;

    return (
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {activity.categories && (
                  <Badge variant="secondary" className="text-xs">
                    {activity.categories.name}
                  </Badge>
                )}
                {activity.average_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{activity.average_rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({activity.review_count} reviews)
                    </span>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold">{activity.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{activity.address || "Location not specified"}</span>
                </div>
                {activity.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{activity.duration}</span>
                  </div>
                )}
                {activity.max_participants && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Up to {activity.max_participants} people</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {activity.currency_code || "THB"} {activity.b_price?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">per person</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!activity) {
      return <div>Activity not found</div>;
    }

    const images = activity.image_url ? [activity.image_url] : (activity.image_urls || []);

    return (
      <div className="bg-white text-black">
        {renderActivityHeader()}
        
        <div className="container py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ActivityGallery images={images} title={activity.title} videos={[]} />
            <ActivityDetails activity={activity} />
            
            {/* Schedule Overview */}
            {scheduleInstances.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {scheduleInstances.slice(0, 5).map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-sm font-medium">
                              {new Date(schedule.scheduled_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(schedule.scheduled_date).toLocaleDateString('en-US', { 
                                weekday: 'short' 
                              })}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {schedule.start_time} - {schedule.end_time}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {schedule.available_spots} of {schedule.capacity} spots available
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {schedule.price_override ? (
                            <div className="text-sm font-medium">
                              {activity.currency_code || "THB"} {schedule.price_override.toLocaleString()}
                            </div>
                          ) : (
                            <div className="text-sm font-medium">
                              {activity.currency_code || "THB"} {activity.b_price?.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {scheduleInstances.length > 5 && (
                    <div className="text-center mt-4">
                      <p className="text-sm text-muted-foreground">
                        +{scheduleInstances.length - 5} more dates available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <ActivityReviews reviews={activity.reviews || []} />
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Availability Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <AvailabilityCalendar 
                  activityId={String(activity.id)} 
                  scheduleData={scheduleInstances}
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
                <CardTitle>Activity Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
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
                  {activity.min_age && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Min Age</span>
                      <span className="text-sm font-medium">{activity.min_age} years</span>
                    </div>
                  )}
                  {activity.physical_effort_level && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Physical Level</span>
                      <span className="text-sm font-medium">{activity.physical_effort_level}</span>
                    </div>
                  )}
                </div>
                
                {activity.instant_booking && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Instant Booking Available</span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <ActivityChat activity={activity} />
          </div>
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
      
      {/* Fixed Action Buttons */}
      <div className="fixed bottom-4 left-4 flex flex-col space-y-2 z-50">
        <Link href="/activity-owner">
          <Button variant="secondary" className="rounded-full shadow-lg">
            <Briefcase className="mr-2 h-4 w-4" /> List your Activity
          </Button>
        </Link>
        <Link href="/partner">
          <Button variant="secondary" className="rounded-full shadow-lg">
            <User className="mr-2 h-4 w-4" /> Become a Partner
          </Button>
        </Link>
      </div>
    </div>
  );
}
