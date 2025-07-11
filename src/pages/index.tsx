
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ActivityRow from "@/components/home/ActivityRow";
import CategoryNav from "@/components/home/CategoryNav";
import CategorySection from "@/components/home/CategorySection";
import { SearchBar } from "@/components/home/SearchBar";
import { activityService } from "@/services/activityService";
import { ActivityForHomepage } from "@/types/activity";
import { ShoppingCart, User, Briefcase } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  const [activities, setActivities] = useState<ActivityForHomepage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await activityService.getActivitiesForHomepage();
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

  const groupedActivities = activities.reduce((acc, activity) => {
    const category = activity.category_name || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(activity);
    return acc;
  }, {} as Record<string, ActivityForHomepage[]>);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <main className="relative">
        <section className="w-full py-8 bg-gray-50 border-b">
          <div className="max-w-4xl mx-auto px-4">
            <SearchBar />
          </div>
        </section>

        <CategoryNav />

        <div className="px-4 md:px-8 lg:px-12 space-y-8 py-8">
          {loading && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Loading activities...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-500">{error}</p>
            </div>
          )}
          {!loading && !error && (
            <>
              {activities.length > 0 ? (
                <>
                  <section>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">Featured Activities</h2>
                      <Link href="/activities">
                        <Button variant="link" className="text-primary">
                          View All
                        </Button>
                      </Link>
                    </div>
                    <ActivityRow activities={activities.slice(0, 10)} />
                  </section>
                  {Object.entries(groupedActivities).map(([category, categoryActivities]) => (
                    <CategorySection
                      key={category}
                      title={category}
                      activities={categoryActivities}
                    />
                  ))}
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">No activities available at the moment.</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="fixed bottom-4 right-4 z-50">
          <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
            <ShoppingCart className="h-6 w-6" />
          </Button>
        </div>
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
      </main>
      <Footer />
    </div>
  );
}
