
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { ProviderLayout } from "@/components/activity-owner/layout/ProviderLayout"
import { activityService, Activity } from "@/services/activityService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Edit, Eye, Plus, Trash2 } from "lucide-react"

export default function ActivitiesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/activity-owner/login");
      return;
    }

    const fetchActivities = async () => {
      if (!user) return;
      
      try {
        const data = await activityService.getActivitiesByProvider(user.id);
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast({
          title: "Error",
          description: "Failed to load activities. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, isAuthenticated, router, toast]);

  const handleDeleteActivity = async () => {
    if (!activityToDelete) return;
    
    try {
      await activityService.deleteActivity(activityToDelete);
      setActivities(activities.filter(activity => activity.id !== activityToDelete));
      toast({
        title: "Activity deleted",
        description: "The activity has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete activity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActivityToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
      case "archived":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
      default:
        return "";
    }
  };

  const publishedActivities = activities.filter(a => a.status === "published");
  const draftActivities = activities.filter(a => a.status === "draft");
  const archivedActivities = activities.filter(a => a.status === "archived");

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading activities...</p>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Manage Activities - Guidestination</title>
        <meta name="description" content="Manage your listed activities" />
      </Head>

      <ProviderLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
              <p className="text-muted-foreground">
                Manage your experiences and listings
              </p>
            </div>
            <Link href="/activity-owner/list-activity">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Activity
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All ({activities.length})</TabsTrigger>
              <TabsTrigger value="published">Published ({publishedActivities.length})</TabsTrigger>
              <TabsTrigger value="draft">Drafts ({draftActivities.length})</TabsTrigger>
              <TabsTrigger value="archived">Archived ({archivedActivities.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <ActivityGrid 
                activities={activities} 
                onDelete={setActivityToDelete} 
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            
            <TabsContent value="published" className="mt-6">
              <ActivityGrid 
                activities={publishedActivities} 
                onDelete={setActivityToDelete} 
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            
            <TabsContent value="draft" className="mt-6">
              <ActivityGrid 
                activities={draftActivities} 
                onDelete={setActivityToDelete} 
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            
            <TabsContent value="archived" className="mt-6">
              <ActivityGrid 
                activities={archivedActivities} 
                onDelete={setActivityToDelete} 
                getStatusColor={getStatusColor}
              />
            </TabsContent>
          </Tabs>
        </div>

        <AlertDialog open={!!activityToDelete} onOpenChange={(open) => !open && setActivityToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the activity and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteActivity}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ProviderLayout>
    </>
  );
}

interface ActivityGridProps {
  activities: Activity[];
  onDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
}

function ActivityGrid({ activities, onDelete, getStatusColor }: ActivityGridProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No activities found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => (
        <Card key={activity.id} className="overflow-hidden">
          <div className="aspect-video relative bg-muted">
            {activity.images && activity.images.length > 0 ? (
              <img 
                src={activity.images[0]} 
                alt={activity.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image
              </div>
            )}
            <Badge 
              className={`absolute top-2 right-2 ${getStatusColor(activity.status)}`}
              variant="outline"
            >
              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
            </Badge>
          </div>
          
          <CardHeader>
            <CardTitle className="line-clamp-1">{activity.title}</CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span className="capitalize">{activity.category.replace('_', ' ')}</span>
              <span>฿{activity.basePrice.toLocaleString()}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                {activity.rating ? (
                  <div className="flex items-center">
                    <span className="mr-1">{activity.rating}</span>
                    <span className="text-yellow-500">★</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({activity.reviewCount})
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No ratings</span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Link href={`/activities/${activity.id}`}>
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/activity-owner/edit-activity/${activity.id}`}>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onDelete(activity.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
