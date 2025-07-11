import { supabase } from "@/integrations/supabase/client";
import { SupabaseActivity } from "@/types/activity";

export type RecommendedActivity = SupabaseActivity & { recommendationReason: string };

export interface UserPreferences {
  travelStyle: string;
  budget: string;
  unavailableDays: string[];
  travelDates: {
    start: Date;
    end: Date;
  };
}

export interface RecommendedPlan {
  activities: RecommendedActivity[];
  totalPrice: number;
  numberOfDays: number;
}

export const recommendationService = {
  async getRecommendations(preferences: any): Promise<any[]> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return [];
    }
    
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        categories(*)
      `)
      .limit(10);

    if (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }

    return (data || []).map((activity: any) => ({
      ...activity,
      category_name: activity.categories?.name || null,
      price: activity.b_price,
    }));
  },
};
