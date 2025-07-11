import { supabase } from "@/integrations/supabase/client";
import { Activity, ActivityForHomepage } from "@/types/activity";
import { currencyService } from "./currencyService";

export const activityService = {
  async getActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        activity_schedules(*)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }

    // Get user's currency with simple fallback
    const userCurrency = currencyService.getUserCurrency();
    
    return (data || []).map(activity => ({
      ...activity,
      category_name: activity.category,
      // Convert price from THB to user's currency - use b_price as the main price
      price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
      b_price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
      // Add currency info for display
      currency: userCurrency
    }));
  },

  async getActivitiesForHomepage(): Promise<ActivityForHomepage[]> {
    const { data, error } = await supabase
      .from("activities")
      .select(`
        id,
        title,
        b_price,
        address,
        average_rating,
        image_url,
        category
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching activities for homepage:", error);
      throw error;
    }

    // Get user's currency with simple fallback
    const userCurrency = currencyService.getUserCurrency();

    return (data || []).map(activity => ({
      ...activity,
      slug: `activity-${activity.id}`, // Generate slug from ID since slug column doesn't exist
      category_name: activity.category,
      location: activity.address || "Location TBD", // Use address as location with fallback
      // Convert price from THB to user's currency - use b_price as the main price
      price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
      b_price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
      // Add currency info for display
      currency: userCurrency
    }));
  },

  async getActivityBySlug(slug: string): Promise<Activity | null> {
    // Extract ID from slug (format: activity-{id})
    const activityId = slug.replace('activity-', '');
    
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        activity_schedules(*)
      `)
      .eq("id", activityId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching activity by slug:", error);
      return null;
    }

    if (!data) return null;

    // Get user's currency and convert prices
    const userCurrency = currencyService.getUserCurrency();

    return {
      ...data,
      slug: `activity-${data.id}`, // Generate slug from ID
      category_name: data.category,
      // Convert price from THB to user's currency - use b_price as the main price
      price: data.b_price ? currencyService.convertFromTHB(data.b_price, userCurrency) : null,
      b_price: data.b_price ? currencyService.convertFromTHB(data.b_price, userCurrency) : null,
      // Add currency info for display
      currency: userCurrency
    };
  },

  async getActivitiesByCategory(categoryName: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        activity_schedules(*)
      `)
      .eq("category", categoryName)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching activities by category:", error);
      throw error;
    }

    // Get user's currency and convert prices
    const userCurrency = currencyService.getUserCurrency();

    return (data || []).map(activity => ({
      ...activity,
      category_name: activity.category,
      // Convert price from THB to user's currency - use b_price as the main price
      price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
      b_price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
      // Add currency info for display
      currency: userCurrency
    }));
  },

  async searchActivities(query: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        activity_schedules(*)
      `)
      .eq("is_active", true)
      .or(`title.ilike.%${query}%, description.ilike.%${query}%, location.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching activities:", error);
      throw error;
    }

    // Get user's currency and convert prices
    const userCurrency = currencyService.getUserCurrency();

    return (data || []).map(activity => ({
      ...activity,
      category_name: activity.category,
      // Convert price from THB to user's currency - use b_price as the main price
      price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
      b_price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
      // Add currency info for display
      currency: userCurrency
    }));
  }
};

export default activityService;
