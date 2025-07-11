import Head from "next/head"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CategoryNav } from "@/components/home/CategoryNav"
import { ActivityRow } from "@/components/home/ActivityRow"
import { SearchBar } from "@/components/home/SearchBar"
import { BottomActionButtons } from "@/components/layout/BottomActionButtons"
import { FloatingCart } from "@/components/layout/FloatingCart"
import { supabase } from "@/integrations/supabase/client"
import categoryService from "@/services/categoryService"
import { SupabaseActivity } from "@/types/activity"
import { activityService } from "@/services/activityService";
import { ActivityForHomepage } from "@/types/activity";
import ActivityCard from "@/components/home/ActivityCard";
import SearchBar from "@/components/home/SearchBar";
import CategoryNav from "@/components/home/CategoryNav";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface HomePageProps {
  featuredActivities: SupabaseActivity[];
  recommendedActivities: SupabaseActivity[];
  activitiesByCategory: { [key: string]: SupabaseActivity[] };
  categories: Category[];
}

export default function HomePage() {
  const [activities, setActivities] = useState<ActivityForHomepage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await activityService.getActivitiesForHomepage();
        setActivities(data);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("Failed to load activities");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">Loading activities...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
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

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <CategoryNav />
        </div>
      </section>

      {/* Featured Activities */}
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
                <Link key={activity.id} href={`/activities/${activity.id}`}>
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

export async function getServerSideProps() {
  try {
    // Fetch featured activities (first 6 activities)
    const { data: featuredActivitiesData } = await supabase
      .from('activities')
      .select('*')
      .eq('is_active', true)
      .limit(6)

    // Fetch recommended activities (random selection)
    const { data: recommendedActivitiesData } = await supabase
      .from('activities')
      .select('*')
      .eq('is_active', true)
      .limit(8)

    const categories = await categoryService.getAllCategories()
    const activitiesByCategory: { [key: string]: SupabaseActivity[] } = {};

    // Fetch activities for each category
    await Promise.all(
      categories.slice(0, 4).map(async (category: Category) => {
        const { data: activities } = await supabase
          .from('activities')
          .select('*')
          .eq('is_active', true)
          .eq('category', category.name)
          .limit(10)
        
        activitiesByCategory[category.name] = activities || [];
      })
    )

    return {
      props: {
        featuredActivities: featuredActivitiesData || [],
        recommendedActivities: recommendedActivitiesData || [],
        activitiesByCategory,
        categories,
      },
    }
  } catch (error) {
    console.error("Error fetching data for homepage:", error)
    return {
      props: {
        featuredActivities: [],
        recommendedActivities: [],
        activitiesByCategory: {},
        categories: [],
      },
    }
  }
}
  
