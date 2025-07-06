import { supabase } from "@/integrations/supabase/client";
import { Database, Tables } from "@/integrations/supabase/types";

export type SupabaseActivity = Tables<"activities"> & {
  category_name?: string;
  owner_email?: string;
  media?: { url: string; type: "image" | "video" }[];
  schedules?: { day_of_week: string; start_time: string; end_time: string }[];
};

export const supabaseActivityService = {
  async getActivityById(id: string): Promise<SupabaseActivity | null> {
    const activityId = parseInt(id, 10);
    if (isNaN(activityId)) {
      const { data, error } = await supabase
        .from("activities")
        .select(`*, categories (name)`)
        .ilike("title", id.replace(/-/g, " "))
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching activity by title:", error);
        return null;
      }
      return data as any;
    }

    const { data, error } = await supabase
      .from("activities")
      .select(`*, categories (name)`)
      .eq("id", activityId)
      .single();

    if (error) {
      console.error("Error fetching activity by ID:", error);
      return null;
    }
    
    const activity = data as any;
    if (activity && activity.categories) {
        activity.category_name = activity.categories.name;
        delete activity.categories;
    }

    return activity as SupabaseActivity;
  },

  async getActivityBySlug(slug: string): Promise<SupabaseActivity | null> {
    return this.getActivityById(slug);
  },

  async getActivityMedia(activityId: number) {
    // This assumes a table `activity_media` exists.
    // It's not in the provided types, so this is a placeholder.
    // Example:
    // const { data, error } = await supabase
    //   .from("activity_media")
    //   .select("url, type")
    //   .eq("activity_id", activityId);
    // if (error) return [];
    // return data;
    return []; // Returning empty array as table doesn't exist
  },

  async getActivitySchedules(activityId: number) {
    // This assumes a table `activity_schedules` exists.
    // It's not in the provided types, so this is a placeholder.
    // Example:
    // const { data, error } = await supabase
    //   .from("activity_schedules")
    //   .select("day_of_week, start_time, end_time")
    //   .eq("activity_id", activityId);
    // if (error) return [];
    // return data;
    return []; // Returning empty array as table doesn't exist
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
    
    const activities = data.map((d: any) => {
        if (d.categories) {
            d.category_name = d.categories.name;
            delete d.categories;
        }
        return d;
    });

    return activities as SupabaseActivity[];
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
    
    const activities = data.map((d: any) => {
        if (d.categories) {
            d.category_name = d.categories.name;
            delete d.categories;
        }
        return d;
    });

    return activities as SupabaseActivity[];
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
    
    const activities = data.map((d: any) => {
        if (d.categories) {
            d.category_name = d.categories.name;
            delete d.categories;
        }
        return d;
    });

    return activities as SupabaseActivity[];
  },

  async createBooking(bookingData: {
    activity_id: number;
    customer_id: string;
    booking_date: string;
    participants: number;
    total_amount: number;
  }) {
    const { data, error } = await supabase
      .from("bookings")
      .insert({ ...bookingData, status: "pending" })
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
