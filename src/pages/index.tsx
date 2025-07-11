
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ActivityRow from "@/components/home/ActivityRow";
import CategoryNav from "@/components/home/CategoryNav";
import CategorySection from "@/components/home/CategorySection";
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  // Group activities by category for Netflix-style layout
  const groupedActivities = activities.reduce((acc, activity) => {
    const category = activity.category_name || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(activity);
    return acc;
  }, {} as Record<string, ActivityForHomepage[]>);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-b from-transparent to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Experiences
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl">
            Find and book unique activities and tours around the world
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Category Navigation */}
      <CategoryNav />

      {/* Netflix-style Activity Sections */}
      <div className="px-4 md:px-8 lg:px-12 space-y-8 pb-20">
        {/* Featured Activities */}
        {activities.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Featured Activities</h2>
              <Link href="/activities">
                <Button variant="ghost" className="text-white hover:text-gray-300">
                  View All
                </Button>
              </Link>
            </div>
            <ActivityRow activities={activities.slice(0, 10)} />
          </section>
        )}

        {/* Category Sections */}
        {Object.entries(groupedActivities).map(([category, categoryActivities]) => (
          <CategorySection
            key={category}
            title={category}
            activities={categoryActivities}
          />
        ))}

        {activities.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No activities available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
