
import { supabase } from "@/integrations/supabase/client";
import { Database, Tables, TablesInsert } from "@/integrations/supabase/types";

export type SupabaseActivity = Tables<"activities"> & {
  category_name?: string;
  owner_email?: string;
  media?: { url: string; type: "image" | "video" }[];
  schedules?: any;
  final_price?: number;
  category?: string;
  reviewCount?: number;
  images?: string[];
  includes_pickup?: boolean;
  pickup_locations?: string;
  includes_meal?: boolean;
  meal_description?: string;
  average_rating?: number;
  videos?: string[];
};

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

export const supabaseActivityService = {
  async getActivityById(id: string): Promise<SupabaseActivity | null> {
    const activityId = parseInt(id, 10);
    let query;
    if (isNaN(activityId)) {
      query = supabase
        .from("activities")
        .select(`*, categories (name)`)
        .ilike("title", id.replace(/-/g, " "))
        .limit(1)
        .single();
    } else {
      query = supabase
        .from("activities")
        .select(`*, categories (name)`)
        .eq("id", activityId)
        .single();
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching activity:", error);
      return null;
    }
    
    return mapActivityData(data);
  },

  async getActivityBySlug(slug: string): Promise<SupabaseActivity | null> {
    return this.getActivityById(slug);
  },

  async getActivityMedia(activityId: number) {
    return []; 
  },

  async getActivitySchedules(activityId: number) {
    return [];
  },

  async getFeaturedActivities(): Promise<SupabaseActivity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*, categories(name)")
      .eq("is_active", true)
      .limit(6);

    if (error) {
      console.error("Error fetching featured activities:", error);
      return [];
    }
    
    return data.map(d => mapActivityData(d)!).filter(d => d !== null);
  },

  async getActivitiesByCategory(categoryId: number): Promise<SupabaseActivity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*, categories(name)")
      .eq("category_id", categoryId)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching activities by category:", error);
      return [];
    }
    
    return data.map(d => mapActivityData(d)!).filter(d => d !== null);
  },

  async searchActivities(query: string): Promise<SupabaseActivity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*, categories(name)")
      .textSearch("title", query, { type: "websearch" })
      .eq("is_active", true);

    if (error) {
      console.error("Error searching activities:", error);
      return [];
    }
    
    return data.map(d => mapActivityData(d)!).filter(d => d !== null);
  },

  async createBooking(bookingData: TablesInsert<'bookings'>) {
    const { data, error } = await supabase
      .from("bookings")
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      throw new Error("Could not create booking.");
    }
    return data;
  },

  async getActivityReviews(activityId: number) {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        customer_profiles ( name )
      `)
      .eq("activity_id", activityId);

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
    return data;
  },

  async addReview(reviewData: {
    activity_id: number;
    user_id: string;
    rating: number;
    comment: string;
  }) {
    const { data, error } = await supabase
      .from("reviews")
      .insert(reviewData)
      .select()
      .single();

    if (error) {
      console.error("Error adding review:", error);
      throw new Error("Could not add review.");
    }
    return data;
  },
};
  