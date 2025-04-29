
    import { useState, useEffect } from "react";
    import Head from "next/head";
    import Link from "next/link";
    import { useAuth } from "@/contexts/AuthContext";
    import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
    import { activityService, Activity } from "@/services/activityService";
    import { useToast } from "@/hooks/use-toast";
    import { Button } from "@/components/ui/button";
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { Plus, Loader2, AlertCircle } from "lucide-react";
    import ActivityCard from "@/components/dashboard/activities/ActivityCard"; // Import the new card component

    type ActivityStatus = "draft" | "published" | "archived";

    export default function ActivitiesPage() {
      const { user, isAuthenticated } = useAuth();
      const { toast } = useToast();
      const [activities, setActivities] = useState<Activity[]>([]);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [activeTab, setActiveTab] = useState<ActivityStatus>("published");

      useEffect(() => {
        if (!isAuthenticated) {
          // Redirect handled by DashboardLayout or AuthContext typically
          setIsLoading(false);
          return;
        }

        const fetchActivities = async () => {
          if (user) {
            setIsLoading(true);
            setError(null);
            try {
              const fetchedActivities = await activityService.getActivitiesByProvider(user.id);
              setActivities(fetchedActivities);
            } catch (err) {
              console.error("Error fetching activities:", err);
              setError("Failed to load activities. Please try again.");
              toast({
                title: "Error",
                description: "Could not fetch your activities.",
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
            }
          } else {
             // Handle case where user is authenticated but object not ready
             // This might briefly show loading or wait for user context
             console.warn("User authenticated but user object not yet available for fetching activities.");
             // Keep loading until user object is available or timeout
          }
        };

        // Fetch only when user object is available
        if (user) {
           fetchActivities();
        } else if (isAuthenticated) {
           // If authenticated but user is null, wait for AuthContext to update
           setIsLoading(true);
        } else {
            // Not authenticated and user is null
            setIsLoading(false);
        }

      }, [user, isAuthenticated, toast]);

      const handleStatusChange = async (activityId: string, newStatus: ActivityStatus) => {
        const originalActivities = [...activities];
        // Optimistically update UI
        setActivities(prev =>
          prev.map(act => (act.id === activityId ? { ...act, status: newStatus } : act))
        );

        try {
          await activityService.updateActivity(activityId, { status: newStatus });
          toast({
            title: "Status Updated",
            description: `Activity moved to ${newStatus}.`,
          });
        } catch (err) {
          console.error("Error updating status:", err);
          // Revert UI on error
          setActivities(originalActivities);
          toast({
            title: "Error",
            description: "Failed to update activity status.",
            variant: "destructive",
          });
        }
      };

       const handleDeleteActivity = async (activityId: string) => {
         if (!confirm("Are you sure you want to permanently delete this activity? This cannot be undone.")) {
           return;
         }

         const originalActivities = [...activities];
         // Optimistically update UI
         setActivities(prev => prev.filter(act => act.id !== activityId));

         try {
           await activityService.deleteActivity(activityId);
           toast({
             title: "Activity Deleted",
             description: "The activity has been permanently deleted.",
           });
         } catch (err) {
           console.error("Error deleting activity:", err);
           // Revert UI on error
           setActivities(originalActivities);
           toast({
             title: "Error",
             description: "Failed to delete activity.",
             variant: "destructive",
           });
         }
       };


      const filteredActivities = activities.filter(activity => activity.status === activeTab);

      const renderContent = () => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading activities...</p>
            </div>
          );
        }

        if (error) {
          return (
            <div className="flex flex-col items-center justify-center py-10 text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          );
        }

        if (filteredActivities.length === 0) {
          return (
            <div className="text-center py-10 text-muted-foreground">
              <p>No activities found in the "{activeTab}" section.</p>
              {activeTab === 'published' && activities.length === 0 && (
                 <p className="mt-2">Click "Add New Activity" to get started!</p>
              )}
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredActivities.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteActivity} // Pass delete handler
              />
            ))}
          </div>
        );
      };

      return (
        <>
          <Head>
            <title>Manage Activities - Provider Dashboard</title>
            <meta name="description" content="View, edit, and manage your activities" />
          </Head>

          <DashboardLayout>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Manage Activities</h1>
                  <p className="text-muted-foreground">
                    View, edit, and manage your listed activities.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/dashboard/activities/new">
                    <Plus className="mr-2 h-4 w-4" /> Add New Activity
                  </Link>
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActivityStatus)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="published">Active</TabsTrigger>
                  <TabsTrigger value="draft">Draft</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
                <TabsContent value="published" className="mt-6">
                  {renderContent()}
                </TabsContent>
                <TabsContent value="draft" className="mt-6">
                  {renderContent()}
                </TabsContent>
                <TabsContent value="archived" className="mt-6">
                  {renderContent()}
                </TabsContent>
              </Tabs>
            </div>
          </DashboardLayout>
        </>
      );
    }
  