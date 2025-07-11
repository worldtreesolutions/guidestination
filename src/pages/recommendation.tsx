
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PreferencesForm, PreferencesFormData } from "@/components/recommendation/PreferencesForm";
import { recommendationService, RecommendedPlan, UserPreferences, RecommendedActivity } from "@/services/recommendationService";
import { Activity, SupabaseActivity } from "@/types/activity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Clock, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePlanning } from "@/contexts/PlanningContext";
import { useToast } from "@/hooks/use-toast";

export default function RecommendationPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<RecommendedPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const { addActivity } = usePlanning();
  const { toast } = useToast();

  useEffect(() => {
    if (recommendations) {
      recommendations.activities.forEach(activity => addActivity(activity as Activity));
      toast({
        title: "All activities added",
        description: "All recommended activities have been added to your plan.",
      });
    }
  }, [recommendations, addActivity, toast]);

  const handleSubmit = async ( PreferencesFormData) => {
    setLoading(true);
    setRecommendations(null);
    try {
      if (!data.travelDates.from || !data.travelDates.to) {
        toast({
          title: "Error",
          description: "Please select travel dates.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const preferences: UserPreferences = {
        ...data,
        travelDates: {
            start: data.travelDates.from,
            end: data.travelDates.to
        }
      }
      const result = await recommendationService.getRecommendations(preferences);
      setRecommendations(result);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      toast({
        title: "Error",
        description: "Could not fetch recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySelect = (activity: RecommendedActivity) => {
    addActivity(activity as Activity);
    toast({
      title: "Activity Added",
      description: `${activity.title} has been added to your plan.`,
    });
  };

  return (
    <>
      <Head>
        <title>Personalized Recommendations - Guidestination</title>
        <meta name="description" content="Get personalized activity recommendations for your stay in Chiang Mai" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8">
              Personalized Planning
            </h1>

            {!recommendations && !loading && (
              <div className="space-y-6">
                <p className="text-center text-base sm:text-lg mb-6 sm:mb-8">
                  Share your preferences to get a customized schedule
                </p>
                <PreferencesForm onSubmit={handleSubmit} />
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mb-4" />
                <p className="text-base sm:text-lg">Creating your personalized schedule...</p>
              </div>
            )}

            {recommendations && (
              <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    Your Recommended Plan
                  </h2>
                  <Button onClick={() => setRecommendations(null)}>
                    Start Over
                  </Button>
                </div>

                <div className="grid gap-4 sm:gap-6">
                  {recommendations.activities.map((activity: RecommendedActivity) => (
                    <Card key={activity.id}>
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-64 h-48">
                          <CardContent className="p-0">
                            <Image
                              src={activity.image_url || '/placeholder.svg'}
                              alt={activity.title}
                              fill
                              className="w-full h-48 object-cover"
                            />
                          </CardContent>
                        </div>
                        <CardContent className="flex-1 p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4 mb-4">
                            <div>
                              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{activity.title}</h3>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                            <div className="text-left sm:text-right mt-2 sm:mt-0">
                              <p className="font-semibold">{activity.b_price?.toLocaleString()} THB</p>
                              <p className="text-sm text-muted-foreground">{activity.duration} hours</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-1">
                              <p className="text-sm">Recommended for you</p>
                            </div>
                            <Button
                              className="w-full sm:w-auto"
                              onClick={() => handleActivitySelect(activity)}
                            >
                              Add to Planning
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>Number of days: {recommendations.numberOfDays}</p>
                      <p>Total budget: {recommendations.totalPrice.toLocaleString()} THB</p>
                      <p>Number of activities: {recommendations.activities.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
