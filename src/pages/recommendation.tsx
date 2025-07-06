import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Activity } from "@/types/activity";
import { Category, Preferences } from "@/types/general";
import { PreferencesForm, PreferencesFormData } from "@/components/recommendation/PreferencesForm";
import { ActivityCard } from "@/components/home/ActivityCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

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

  const handlePreferencesSubmit = async (data: PreferencesFormData) => {
    setLoading(true);
    setError(null);

    const newPreferences: Preferences = {
      categories: data.categories.map(Number),
      priceRange: data.priceRange,
      duration: data.duration,
    };
    setPreferences(newPreferences);

    try {
      const recommendations = await recommendationService.getRecommendations({
        categories: (data as any).categories,
        price_range: (data as any).priceRange,
        duration_range: (data as any).duration,
      });

      setRecommendations(recommendations);
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
            <PreferencesForm onSubmit={handlePreferencesSubmit} categories={categories} />
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
                    {recommendations.map((activity) => {
                      const cardActivity = {
                        id: activity.id.toString(),
                        name: activity.title,
                        image: activity.image_url || (activity.images && activity.images[0]?.url) || '',
                        price: activity.final_price || activity.price_per_person,
                        rating: activity.reviews?.reduce((acc, r) => acc + r.rating, 0) / (activity.reviews?.length || 1) || 5,
                        reviewCount: activity.reviews?.length || 0,
                      };
                      return <ActivityCard key={activity.id} activity={cardActivity} />;
                    })}
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
