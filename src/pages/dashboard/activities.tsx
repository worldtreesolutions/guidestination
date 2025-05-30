
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import activityCrudService, { Activity as CrudActivity, ActivityUpdate } from "@/services/activityCrudService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import ActivityCard from "@/components/dashboard/activities/ActivityCard";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

type ActivityStatus = number;

const statusMap: { [key: string]: ActivityStatus | null } = {
  active: 2, // Published/Active status is 2
  draft: 1, // Draft status is 1
  archived: 0, // Archived status is 0
  all: null, // For showing all activities
};

const defaultTab = "active";

export default function ActivitiesPage() {
  const { user, isAuthenticated, provider_id: contextProviderId } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activities, setActivities] = useState<CrudActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>(defaultTab);
  const [providerId, setProviderId] = useState<string | undefined>(undefined);

  // Get provider_id from multiple sources
  useEffect(() => {
    const getProviderId = async () => {
      // First try to get from context
      if (contextProviderId) {
        console.log('Using provider_id from context:', contextProviderId);
        setProviderId(contextProviderId);
        return;
      }

      // Then try localStorage
      const storedProviderId = localStorage.getItem('provider_id');
      if (storedProviderId) {
        console.log('Using provider_id from localStorage:', storedProviderId);
        setProviderId(storedProviderId);
        return;
      }

      // Finally, query the database directly if user is available
      if (user) {
        try {
          // Fix: Use 'provider_id' instead of 'id' in the select query
          const { data: ownerData, error: ownerError } = await supabase
            .from('activity_owners')
            .select('provider_id')
            .eq('user_id', user.id)
            .single();
            
          if (!ownerError && ownerData) {
            const fetchedProviderId = ownerData.provider_id;
            console.log('Found provider_id from database query:', fetchedProviderId);
            setProviderId(fetchedProviderId);
            
            // Save to localStorage for future use
            localStorage.setItem('provider_id', fetchedProviderId);
          } else {
            console.warn('No activity owner record found for this user');
          }
        } catch (err) {
          console.error('Error fetching provider_id from database:', err);
        }
      }
    };

    if (isAuthenticated) {
      getProviderId();
    }
  }, [user, isAuthenticated, contextProviderId]);

  // Fetch activities when providerId is available
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchActivities = async () => {
      if (!providerId) {
        // If no providerId yet but user is authenticated, keep loading
        if (user) {
          setIsLoading(true);
        } else {
          setIsLoading(false);
        }
        return;
      }

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
    };

    fetchActivities();
  }, [user, isAuthenticated, toast, providerId]);

  // Fixed to match the expected signature in ActivityCard
  const handleStatusChange = (activityId: number, newStatusValue: number | string) => {
    if (!user) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }
    
    // Convert string status to number if needed
    const numericStatus = typeof newStatusValue === 'string' 
      ? (newStatusValue === 'published' ? 2 : newStatusValue === 'draft' ? 1 : 0)
      : newStatusValue;
    
    const originalActivities = [...activities];
    setActivities(prev =>
      prev.map(act => (act.activity_id === activityId ? { ...act, status: numericStatus } : act))
    );

    // Async function to update the status
    const updateStatus = async () => {
      try {
        const updateData: ActivityUpdate = { status: numericStatus };
        await activityCrudService.updateActivity(activityId, updateData, user);
        toast({
          title: "Status Updated",
          description: `Activity status changed.`,
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
    
    // Call the async function
    updateStatus();
  };

  const handleDeleteActivity = (activityId: number) => {
    if (!user) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }
    
    if (!confirm("Are you sure you want to permanently delete this activity? This cannot be undone.")) {
      return;
    }

    const originalActivities = [...activities];
    setActivities(prev => prev.filter(act => act.activity_id !== activityId)); // Optimistic UI update

    // Async function to delete the activity
    const deleteActivity = async () => {
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
    
    // Call the async function
    deleteActivity();
  };

  const currentStatusFilter = statusMap[activeTabKey];
  const filteredActivities = currentStatusFilter === null
    ? activities // Show all if 'all' tab selected
    : activities.filter(activity => activity.status === currentStatusFilter);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-[#ededed]" />
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
            key={activity.activity_id}
            activity={activity}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteActivity}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{t("dashboard.activities.title") || "Manage Activities - Provider Dashboard"}</title>
        <meta name="description" content={t("dashboard.activities.description") || "View, edit, and manage your activities"} />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.activities.manage") || "Manage Activities"}</h1>
              <p className="text-muted-foreground">
                {t("dashboard.activities.subtitle") || "View, edit, and manage your listed activities."}
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/activities/new">
                <Plus className="mr-2 h-4 w-4" /> {t("dashboard.activities.addNew") || "Add New Activity"}
              </Link>
            </Button>
          </div>

          <Tabs value={activeTabKey} onValueChange={(value) => setActiveTabKey(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">{t("dashboard.activities.active") || "Active"}</TabsTrigger>
              <TabsTrigger value="draft">{t("dashboard.activities.draft") || "Draft"}</TabsTrigger>
              <TabsTrigger value="archived">{t("dashboard.activities.archived") || "Archived"}</TabsTrigger>
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
