
import { PreferencesFormData } from "@/components/recommendation/PreferencesForm";
import { supabase } from "@/integrations/supabase/client";
import { SupabaseActivity } from "./supabaseActivityService";

export interface RecommendedActivity extends SupabaseActivity {
  timeSlot: string;
  day: string;
}

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

// This is a mock implementation. Replace with your actual recommendation logic.
export const recommendActivities = async (
  preferences: UserPreferences
): Promise<RecommendedPlan> => {
  // For now, just fetch some featured activities as a mock recommendation
  const { data, error } = await supabase
    .from("activities")
    .select("*, categories(name)")
    .limit(5);

  if (error) {
    console.error("Error fetching activities for recommendation:", error);
    return { activities: [], totalPrice: 0, numberOfDays: 0 };
  }

  const activities = data.map(d => mapActivityData(d)!).filter(d => d !== null) as SupabaseActivity[];

  // Mock assigning day and timeslot
  const recommendedActivities: RecommendedActivity[] = activities.map((act, index) => ({
    ...act,
    day: `Day ${index + 1}`,
    timeSlot: "Morning",
  }));

  const plan: RecommendedPlan = {
    activities: recommendedActivities,
    totalPrice: recommendedActivities.reduce((sum, act) => sum + (act.price || 0), 0),
    numberOfDays: 3, // Mock value
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(plan);
    }, 1000); // Simulate network delay
  });
};

export const recommendationService = {
  getRecommendations: recommendActivities,
};

// Helper function to map data, should be consistent with supabaseActivityService
const mapActivityData = (activity: any): SupabaseActivity | null => {
    if (!activity) return null;

    const newActivity = { ...activity };

    if (newActivity.categories) {
        newActivity.category_name = newActivity.categories.name;
        newActivity.category = newActivity.categories.name;
        delete newActivity.categories;
    }
    
    newActivity.final_price = newActivity.price;
    newActivity.reviewCount = newActivity.review_count;
    newActivity.images = newActivity.image_urls;
    newActivity.average_rating = newActivity.rating;
    
    newActivity.videos = newActivity.videos || [];
    newActivity.includes_pickup = newActivity.includes_pickup || false;
    newActivity.pickup_locations = newActivity.pickup_locations || "";
    newActivity.includes_meal = newActivity.includes_meal || false;
    newActivity.meal_description = newActivity.meal_description || "";
    newActivity.schedules = newActivity.schedules || { availableDates: [] };

    return newActivity as SupabaseActivity;
}
