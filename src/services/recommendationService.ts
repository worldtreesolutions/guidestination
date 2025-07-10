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

export class RecommendationService {
  private async fetchRecommendedActivities(preferences: UserPreferences): Promise<SupabaseActivity[]> {
    const { travelStyle, budget, unavailableDays, travelDates } = preferences;
    const { start, end } = travelDates;

    // For now, just fetch some featured activities as a mock recommendation
    const { data, error } = await supabase
      .from("activities")
      .select("*, categories(name)")
      .eq("is_active", true)
      .limit(20);

    if (error) {
      console.error("Error fetching recommended activities:", error);
      return [];
    }

    return data.map(a => ({...a, category_name: a.categories.name})) as unknown as SupabaseActivity[];
  }

  private calculateTotalPrice(activities: SupabaseActivity[]): number {
    return activities.reduce((total, activity) => total + (activity.price || 0), 0);
  }

  public async getRecommendations(preferences: UserPreferences): Promise<RecommendedPlan> {
    const activities = await this.fetchRecommendedActivities(preferences);

    // Mock assigning day and timeslot
    const recommendedActivities: RecommendedActivity[] = activities.map((act, index) => ({
      ...act,
      day: `Day ${index + 1}`,
      timeSlot: "Morning",
      recommendationReason: "Mock reason",
    }));

    const plan: RecommendedPlan = {
      activities: recommendedActivities,
      totalPrice: this.calculateTotalPrice(recommendedActivities),
      numberOfDays: 3, // Mock value
    };

    return plan;
  }
}

export const recommendationService = new RecommendationService();
