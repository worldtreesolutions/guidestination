import { useState, useEffect } from "react";
    import Head from "next/head";
    import Link from "next/link";
    import { useAuth } from "@/contexts/AuthContext";
    import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
    import activityCrudService, { Activity as CrudActivity, ActivityUpdate } from "@/services/activityCrudService"; // Changed import
    import { useToast } from "@/hooks/use-toast";
    import { Button } from "@/components/ui/button";
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { Plus, Loader2, AlertCircle } from "lucide-react";
    import ActivityCard from "@/components/dashboard/activities/ActivityCard"; // Import the new card component

    type ActivityStatus = number; // Or string if status is stored as text like 'published', 'draft'

    const statusMap: { [key: string]: ActivityStatus | null } = {
      active: 1, // Example: 1 means active/published
      draft: 0, // Example: 0 means draft
      archived: 2, // Example: 2 means archived
      all: null, // For showing all activities
    };
    const defaultTab = "active"; // Default tab to show

    export default function ActivitiesPage() {
      const { user, isAuthenticated } = useAuth();
      const { toast } = useToast();
      const [activities, setActivities] = useState<CrudActivity[]>([]); // Use CrudActivity type
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [activeTabKey, setActiveTabKey] = useState<string>(defaultTab);
      const [providerId, setProviderId] = useState<number | null>(null);

      // Fetch provider ID from database or use hardcoded test value
      useEffect(() => {
        if (user) {
          // Get provider ID from user metadata and ensure it's a number
          const metadataProviderId = user.app_metadata?.provider_id;
          const fetchedProviderId = metadataProviderId ? Number(metadataProviderId) : 1;
          
          setProviderId(fetchedProviderId);
          console.log('Provider ID set to:', fetchedProviderId, 'Type:', typeof fetchedProviderId);
          console.log('Original provider ID from metadata:', metadataProviderId, 'Type:', typeof metadataProviderId);
        }
      }, [user]);

      useEffect(() => {
        if (!isAuthenticated) {
          setIsLoading(false);
          return;
        }

        const fetchActivities = async () => {
          if (providerId) {
            setIsLoading(true);
            setError(null);
            try {
              console.log('Fetching activities for provider ID:', providerId);
              const { activities: fetchedActivities } = await activityCrudService.getActivitiesByProviderId(providerId);
              console.log('Fetched activities:', fetchedActivities);
              setActivities(fetchedActivities);
            } catch (err: any) {
              console.error('Error fetching activities:', err);
              setError('Failed to load activities. Please try again.');
              toast({
                title: 'Error',
                description: `Could not fetch your activities: ${err.message}`,
                variant: 'destructive',
              });
            } finally {
              setIsLoading(false);
            }
          } else if (user) {
            setIsLoading(false);
            setError('Provider ID not found for your account.');
            console.warn('User authenticated but provider_id missing in metadata.');
            toast({ 
              title: 'Warning', 
              description: 'Using test provider ID. In production, your account should be linked to a provider.', 
              variant: 'default' 
            });
          } else {
            console.warn('User authenticated but user object not yet available for fetching activities.');
            setIsLoading(true); // Keep loading until user object is available
          }
        };

        if (providerId) {
          fetchActivities();
        } else if (user) {
          // If user exists but no providerId yet, wait for providerId to be set
          setIsLoading(true);
        } else if (isAuthenticated) {
          setIsLoading(true);
        } else {
          setIsLoading(false);
        }
      }, [user, isAuthenticated, toast, providerId]);

      const handleStatusChange = async (activityId: number, newStatusValue: ActivityStatus) => {
         if (!user) {
            toast({ title: "Error", description: "User not found.", variant: "destructive" });
            return;
         }
        const originalActivities = [...activities];
        setActivities(prev =>
          prev.map(act => (act.id === activityId ? { ...act, status: newStatusValue } : act))
        );

        try {
          const updateData: ActivityUpdate = { status: newStatusValue };
          await activityCrudService.updateActivity(activityId, updateData, user);
          toast({
            title: "Status Updated",
            description: `Activity status changed.`, // Adjust message as needed
          });
        } catch (err: any) {
          console.error("Error updating status:", err);
          setActivities(originalActivities); // Revert UI
          toast({
            title: "Error",
            description: `Failed to update activity status: ${err.message}`,
            variant: "destructive",
          });
        }
      };

       const handleDeleteActivity = async (activityId: number) => {
         if (!user) {
            toast({ title: "Error", description: "User not found.", variant: "destructive" });
            return;
         }
         if (!confirm("Are you sure you want to permanently delete this activity? This cannot be undone.")) {
           return;
         }

         const originalActivities = [...activities];
         setActivities(prev => prev.filter(act => act.id !== activityId)); // Optimistic UI update

         try {
           await activityCrudService.hardDeleteActivity(activityId);
           toast({
             title: "Activity Deleted",
             description: "The activity has been permanently deleted.",
           });
         } catch (err: any) {
           console.error("Error deleting activity:", err);
           setActivities(originalActivities); // Revert UI
           toast({
             title: "Error",
             description: `Failed to delete activity: ${err.message}`,
             variant: "destructive",
           });
         }
       };

      const currentStatusFilter = statusMap[activeTabKey];
      const filteredActivities = currentStatusFilter === null
        ? activities // Show all if 'all' tab selected
        : activities.filter(activity => activity.status === currentStatusFilter);

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
              <p>No activities found in the "{activeTabKey}" section.</p>
              {activeTabKey === 'active' && activities.length === 0 && (
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

              <Tabs value={activeTabKey} onValueChange={(value) => setActiveTabKey(value)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="draft">Draft</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="mt-6">
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