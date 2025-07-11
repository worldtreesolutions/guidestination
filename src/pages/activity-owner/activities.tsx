import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, Booking } from "@/types/activity";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { ActivityCard } from "@/components/dashboard/activities/ActivityCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import activityService from "@/services/activityService";
import { bookingService } from "@/services/bookingService";

export default function ActivitiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityWithDetails[]>([]);
  const [activityBookings, setActivityBookings] = useState<Record<string, Booking[]>>({});

  const fetchActivitiesAndBookings = useCallback(async () => {
    if (user) {
      const ownerId = user.id;
      try {
        setLoading(true);
        const [fetchedActivities, fetchedBookings] = await Promise.all([
          activityService.fetchActivitiesByOwner(ownerId),
          bookingService.fetchBookingsForOwner(ownerId),
        ]);
        setActivities(fetchedActivities);
      } catch (error: any) {
        console.error("Error fetching activities and bookings:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch activities and bookings.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  }, [user, toast]);

  useEffect(() => {
    fetchActivitiesAndBookings();
  }, [fetchActivitiesAndBookings]);

  const handleDelete = async (activityId: number) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await activityService.deleteActivity(activityId);
        setActivities(activities.filter((act) => act.id !== activityId));
        toast({
          title: "Activity Deleted",
          description: "The activity has been successfully deleted.",
        });
      } catch (error) {
        console.error("Error deleting activity:", error);
        toast({
          title: "Error",
          description: "Failed to delete activity.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (activityId: number) => {
    router.push(`/dashboard/activities/${activityId}`);
  };

  const handleView = (activity: Activity) => {
    const slug = activity.title.toLowerCase().replace(/\s+/g, "-");
    window.open(`/activities/${slug}`, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Activities</h1>
        <Button onClick={() => router.push("/activity-owner/list-activity")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Activity
        </Button>
      </div>
      {loading ? (
        <p>Loading activities...</p>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-medium">No activities found</h3>
          <p className="text-muted-foreground mt-2">
            Start by creating a new activity to get started.
          </p>
          <Button className="mt-4" onClick={() => router.push("/activity-owner/list-activity")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Activity
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onPreview={(id) => router.push(`/activity-owner/activities?preview=${id}`)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
