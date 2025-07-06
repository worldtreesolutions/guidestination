
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Activity } from "@/types/activity";
import { Category, Preferences } from "@/types/general";
import { PreferencesForm, PreferencesFormData } from "@/components/recommendation/PreferencesForm";
import ActivityCard from "@/components/dashboard/activities/ActivityCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

// Create a simple recommendation service function
const getRecommendations = async (params: {
  categories: number[];
  price_range: [number, number];
  duration_range: [number, number];
}): Promise<Activity[]> => {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .in("category_id", params.categories)
    .gte("b_price", params.price_range[0])
    .lte("b_price", params.price_range[1])
    .limit(20);

  if (error) throw error;

  // Manually map Supabase data to Activity type
  const mappedData: Activity[] = data.map((item: any) => ({
    id: item.id,
    activity_id: item.activity_id,
    title: item.title,
    name: item.name,
    description: item.description,
    price_per_person: item.b_price || 0,
    duration_hours: item.duration ? parseInt(item.duration, 10) : 2,
    duration: item.duration,
    availability: item.availability || "",
    location: item.location || "",
    category: item.category || "",
    category_id: item.category_id,
    images: item.image_url ? [{ url: item.image_url }] : [],
    image_url: item.image_url,
    inclusions: item.included || [],
    exclusions: item.not_included || [],
    reviews: [],
    provider_id: item.provider_id,
    created_at: item.created_at,
    updated_at: item.updated_at,
    is_active: item.is_active,
    booking_count: item.booking_count,
    total_revenue: item.total_revenue,
    final_price: item.final_price,
    b_price: item.b_price,
    price: item.price,
    status: item.status,
    video_url: item.video_url,
    video_duration: item.video_duration,
    max_participants: item.max_participants,
    rating: item.average_rating,
    highlights: item.highlights,
    included: item.included,
  }));

  return mappedData;
};

export default function RecommendationPage() {
  const { t } = useLanguage();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [recommendations, setRecommendations] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data as Category[]);
      }
    };
    fetchCategories();
  }, []);

  const handlePreferencesSubmit = async ( PreferencesFormData) => {
    setLoading(true);
    setError(null);

    const newPreferences: Preferences = {
      categories: data.categories.map(Number),
      priceRange: data.priceRange,
      duration: data.duration,
    };
    setPreferences(newPreferences);

    try {
      const recommendationsResult = await getRecommendations({
        categories: data.categories,
        price_range: data.priceRange,
        duration_range: data.duration,
      });

      setRecommendations(recommendationsResult);
    } catch (err: any) {
      setError("Failed to fetch recommendations. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPreferences(null);
    setRecommendations([]);
    setError(null);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Find Your Perfect Activity</h1>
          <p className="text-lg text-gray-600 mt-2">
            Tell us your preferences, and we'll find the best experiences in Chiang Mai for you.
          </p>
        </div>

        {!preferences ? (
          <div className="max-w-2xl mx-auto">
            <PreferencesForm onSubmit={handlePreferencesSubmit} />
          </div>
        ) : (
          <div>
            <div className="flex justify-center mb-6">
              <Button onClick={handleReset}>Change Preferences</Button>
            </div>
            {loading && <div className="text-center">Loading recommendations...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            {!loading && !error && (
              <div>
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} showActions={false} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold">No Recommendations Found</h2>
                    <p className="mt-2 text-gray-600">
                      We couldn't find any activities matching your preferences. Try adjusting your criteria.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
