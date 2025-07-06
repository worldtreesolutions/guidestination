import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SupabaseActivity } from "@/services/supabaseActivityService";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { ActivityCard } from "@/components/dashboard/activities/ActivityCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ActivitiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<SupabaseActivity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) {
        router.push("/activity-owner/login");
        return;
      }

      setLoading(true);

      try {
        const { data: ownerData, error: ownerError } = await supabase
          .from("activity_owners")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (ownerError || !ownerData) {
          console.error("Error fetching activity owner:", ownerError);
          toast({
            title: "Error",
            description: "Could not find activity owner profile.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("activities")
          .select("*, categories(name)")
          .eq("owner_id", ownerData.id);

        if (error) {
          throw error;
        }
        
        const mappedData = data.map(d => ({
            ...d,
            category_name: d.categories?.name || "Uncategorized"
        })) as SupabaseActivity[];

        setActivities(mappedData);
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast({
          title: "Error",
          description: "Failed to fetch your activities.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchActivities();
    }
  }, [user, router, toast]);

  const handleDelete = async (activityId: number) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        const { error } = await supabase
          .from("activities")
          .delete()
          .eq("id", activityId);

        if (error) throw error;

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

  const handleEdit = (activity: SupabaseActivity) => {
    router.push(`/dashboard/activities/${activity.id}`);
  };

  const handleView = (activity: SupabaseActivity) => {
    const slug = activity.title.toLowerCase().replace(/\s+/g, '-');
    window.open(`/activities/${slug}`, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Activities</h1>
        <Button onClick={() => router.push("/dashboard/activities/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Activity
        </Button>
      </div>
      {loading ? (
        <p>Loading activities...</p>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No activities found</h3>
            <p className="text-muted-foreground mt-2">Start by creating a new activity to get started.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/activities/new")}>
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
              onView={handleView}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
