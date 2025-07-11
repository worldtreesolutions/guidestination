import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ActivityRow from "@/components/home/ActivityRow";
import CategoryNav from "@/components/home/CategoryNav";
import CategorySection from "@/components/home/CategorySection";
import SearchBar from "@/components/home/SearchBar";
import { activityService } from "@/services/activityService";
import { categoryService, Category } from "@/services/categoryService";
import { ActivityForHomepage } from "@/types/activity";
import { ShoppingCart, User, Briefcase } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Head from "next/head";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HomePage() {
  const [activities, setActivities] = useState<ActivityForHomepage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both activities and categories
        const [activitiesData, categoriesData] = await Promise.all([
          activityService.getActivitiesForHomepage(),
          categoryService.getAllCategories()
        ]);
        
        setActivities(activitiesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter activities based on selected category
  const filteredActivities = selectedCategoryId 
    ? activities.filter(activity => {
        const selectedCategory = categories.find(c => c.id === selectedCategoryId);
        return selectedCategory && activity.category_name === selectedCategory.name;
      })
    : activities;

  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    const category = activity.category_name || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(activity);
    return acc;
  }, {} as Record<string, ActivityForHomepage[]>);

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Head>
        <title>Home Page</title>
      </Head>
      <Navbar />
      <main className="relative">
        <section className="w-full py-8 bg-white border-b">
          <div className="max-w-4xl mx-auto px-4">
            <SearchBar />
          </div>
        </section>

        <CategoryNav 
          onCategorySelect={handleCategorySelect}
          selectedCategoryId={selectedCategoryId}
        />

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
              {filteredActivities.length > 0 ? (
                <>
                  <section>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">
                        {selectedCategoryId 
                          ? `${categories.find(c => c.id === selectedCategoryId)?.name || 'Category'} Activities`
                          : 'Featured Activities'
                        }
                      </h2>
                      <Link href="/activities">
                        <Button variant="link" className="text-primary">
                          View All
                        </Button>
                      </Link>
                    </div>
                    <ActivityRow activities={filteredActivities.slice(0, 10)} />
                  </section>
                  {!selectedCategoryId && Object.entries(groupedActivities).map(([category, categoryActivities]) => (
                    <CategorySection
                      key={category}
                      title={category}
                      activities={categoryActivities}
                    />
                  ))}
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">
                    {selectedCategoryId 
                      ? `No activities available in ${categories.find(c => c.id === selectedCategoryId)?.name || 'this category'}.`
                      : 'No activities available at the moment.'
                    }
                  </p>
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
