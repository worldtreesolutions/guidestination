
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { SupabaseActivity, Category } from "@/types/activity";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/router";
import Head from "next/head";
import { PreferencesForm } from "@/components/recommendation/PreferencesForm";
import ActivityCard from "@/components/home/ActivityCard";

type Preferences = {
  categories: string[];
  priceRange: [number, number];
  duration: [number, number];
};

export default function RecommendationPage() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [recommendations, setRecommendations] = useState<SupabaseActivity[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { t } = useLanguage();
  const router = useRouter();

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

  const handlePreferencesSubmit = async (newPreferences: Preferences) => {
    setPreferences(newPreferences);
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      let query = supabase
        .from("activities")
        .select(
          `
          *,
          category:categories(name),
          activity_images:activity_images(url)
        `
        )
        .gte("price_per_person", newPreferences.priceRange[0])
        .lte("price_per_person", newPreferences.priceRange[1])
        .gte("duration_hours", newPreferences.duration[0])
        .lte("duration_hours", newPreferences.duration[1])
        .eq("status", "published");

      if (newPreferences.categories.length > 0) {
        query = query.in("category_id", newPreferences.categories);
      }

      const { data, error } = await query.limit(10);

      if (error) {
        throw error;
      }

      setRecommendations(data as SupabaseActivity[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t("recommendation.meta.title")}</title>
        <meta
          name="description"
          content={t("recommendation.meta.description")}
        />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t("recommendation.title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {t("recommendation.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <PreferencesForm
              categories={categories}
              onSubmit={handlePreferencesSubmit}
              loading={loading}
            />
          </aside>

          <main className="lg:col-span-3">
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center h-64"
                >
                  <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!loading && recommendations.length === 0 && preferences && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-gray-500"
                >
                  <p>{t("recommendation.noResults")}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {recommendations.map((activity) => (
                <motion.div
                  key={activity.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <ActivityCard activity={activity} />
                </motion.div>
              ))}
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}
