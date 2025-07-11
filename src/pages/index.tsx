import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ActivityRow from "@/components/home/ActivityRow";
import CategoryNav from "@/components/home/CategoryNav";
import CategorySection from "@/components/home/CategorySection";
import SearchBar from "@/components/home/SearchBar";
import activityService from "@/services/activityService";
import { categoryService, Category } from "@/services/categoryService";
import { ActivityForHomepage } from "@/types/activity";
import { ShoppingCart, User, Briefcase } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Head from "next/head";

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
        
        // Check if services are available and have required methods
        if (!activityService || typeof activityService.getActivitiesForHomepage !== 'function') {
          throw new Error("Activity service not properly initialized. Please check your Supabase configuration.");
        }
        
        if (!categoryService || typeof categoryService.getAllCategories !== 'function') {
          throw new Error("Category service not properly initialized. Please check your Supabase configuration.");
        }
        
        // Fetch both activities and categories with individual error handling
        let activitiesData: ActivityForHomepage[] = [];
        let categoriesData: Category[] = [];
        
        try {
          activitiesData = await activityService.getActivitiesForHomepage();
          console.log("Activities fetched successfully:", activitiesData.length, "activities");
          console.log("Sample activity data:", activitiesData[0]);
        } catch (activityError) {
          console.error("Failed to fetch activities:", activityError);
          activitiesData = [];
        }
        
        try {
          categoriesData = await categoryService.getAllCategories();
          console.log("Categories fetched successfully:", categoriesData.length, "categories");
        } catch (categoryError) {
          console.error("Failed to fetch categories:", categoryError);
          categoriesData = [];
        }
        
        setActivities(activitiesData || []);
        setCategories(categoriesData || []);
        
        console.log("Final state - Activities:", activitiesData.length, "Categories:", categoriesData.length);
        
        // If both failed, show error
        if (activitiesData.length === 0 && categoriesData.length === 0) {
          setError("Unable to load data. Please check your Supabase configuration.");
        }
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        // Set empty arrays as fallback
        setActivities([]);
        setCategories([]);
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

  // Group all activities by category for Netflix-style display
  const groupedActivities = activities.reduce((acc, activity) => {
    const category = activity.category_name || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(activity);
    return acc;
  }, {} as Record<string, ActivityForHomepage[]>);

  // Get categories that have activities
  const categoriesWithActivities = categories.filter(category => 
    activities.some(activity => activity.category_name === category.name)
  );

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Head>
        <title>Guidestination - Discover Amazing Activities</title>
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

        <div className="px-4 md:px-8 lg:px-12 space-y-12 py-8">
          {loading && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Loading activities...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-gray-500">Please check your Supabase configuration and try again.</p>
              <p className="text-sm text-gray-400 mt-2">
                Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables.
              </p>
            </div>
          )}
          {!loading && !error && (
            <>
              {selectedCategoryId ? (
                // Show filtered activities for selected category
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">
                      {categories.find(c => c.id === selectedCategoryId)?.name || 'Category'} Activities
                    </h2>
                    <Link href="/activities">
                      <Button variant="link" className="text-primary">
                        View All
                      </Button>
                    </Link>
                  </div>
                  {filteredActivities.length > 0 ? (
                    <ActivityRow activities={filteredActivities} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">
                        No activities available in {categories.find(c => c.id === selectedCategoryId)?.name || 'this category'}.
                      </p>
                    </div>
                  )}
                </section>
              ) : (
                // Show all categories with their activities (Netflix-style)
                <>
                  {activities.length > 0 && (
                    <section>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold">Featured Activities</h2>
                        <Link href="/activities">
                          <Button variant="link" className="text-primary">
                            View All
                          </Button>
                        </Link>
                      </div>
                      <ActivityRow activities={activities.slice(0, 10)} />
                    </section>
                  )}
                  
                  {/* Debug information */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="bg-gray-100 p-4 rounded-lg text-sm">
                      <p><strong>Debug Info:</strong></p>
                      <p>Total Activities: {activities.length}</p>
                      <p>Total Categories: {categories.length}</p>
                      <p>Categories with Activities: {categoriesWithActivities.length}</p>
                      {activities.length > 0 && (
                        <p>Sample Activity: {activities[0]?.title} (ID: {activities[0]?.id})</p>
                      )}
                    </div>
                  )}
                  
                  {/* Netflix-style category sections */}
                  {categoriesWithActivities.map((category) => {
                    const categoryActivities = groupedActivities[category.name] || [];
                    if (categoryActivities.length === 0) return null;
                    
                    return (
                      <CategorySection
                        key={category.id}
                        title={category.name}
                        activities={categoryActivities}
                      />
                    );
                  })}
                  
                  {/* Show "Other" category if it exists */}
                  {groupedActivities['Other'] && groupedActivities['Other'].length > 0 && (
                    <CategorySection
                      title="Other Activities"
                      activities={groupedActivities['Other']}
                    />
                  )}
                  
                  {activities.length === 0 && (
                    <div className="text-center py-20">
                      <p className="text-gray-500 text-lg">No activities available at the moment.</p>
                      <p className="text-sm text-gray-400 mt-2">
                        This might be due to Supabase configuration issues or no data in the database.
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="fixed bottom-4 right-4 z-50">
          <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
            <ShoppingCart className="h-6 w-6" />
          </Button>
        </div>
        <div className="fixed bottom-4 left-4 flex flex-row space-x-2 z-50">
          <Link href="/activity-owner">
            <Button variant="secondary" className="rounded-full shadow-lg bg-gradient-to-r from-[#018fcd] to-[#00ac50] hover:from-[#0177b8] hover:to-[#009a47] text-white border-0">
              <Briefcase className="mr-2 h-4 w-4" /> List your Activity
            </Button>
          </Link>
          <Link href="/partner">
            <Button variant="secondary" className="rounded-full shadow-lg bg-gradient-to-r from-[#018fcd] to-[#00ac50] hover:from-[#0177b8] hover:to-[#009a47] text-white border-0">
              <User className="mr-2 h-4 w-4" /> Become a Partner
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
