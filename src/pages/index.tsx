import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ActivityCard from "@/components/home/ActivityCard";
import { SearchBar } from "@/components/home/SearchBar";
import { activityService } from "@/services/activityService";
import { ActivityForHomepage } from "@/types/activity";

export default function HomePage() {
  const [activities, setActivities] = useState<ActivityForHomepage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching activities...");
        const data = await activityService.getActivitiesForHomepage();
        console.log("Activities fetched:", data);
        setActivities(data);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError(`Failed to load activities: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Experiences
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Find and book unique activities and tours around the world
          </p>
          <SearchBar />
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Activities</h2>
            <Link href="/activities">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          {activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activities.map((activity) => (
                <Link key={activity.id} href={`/activities/${activity.slug || `activity-${activity.id}`}`} passHref>
                  <ActivityCard activity={activity} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No activities available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
