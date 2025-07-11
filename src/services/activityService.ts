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
      // Convert price from THB to user's currency
      price: activity.price ? currencyService.convertFromTHB(activity.price, userCurrency) : null,
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
        slug,
        title,
        price,
        b_price,
        location,
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
      category_name: activity.category,
      // Convert price from THB to user's currency
      price: activity.price ? currencyService.convertFromTHB(activity.price, userCurrency) : null,
      b_price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
      // Add currency info for display
      currency: userCurrency
    }));
  },

  async getActivityBySlug(slug: string): Promise<Activity | null> {
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        activity_schedules(*)
      `)
      .eq("slug", slug)
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
      category_name: data.category,
      // Convert price from THB to user's currency
      price: data.price ? currencyService.convertFromTHB(data.price, userCurrency) : null,
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
      // Convert price from THB to user's currency
      price: activity.price ? currencyService.convertFromTHB(activity.price, userCurrency) : null,
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
      // Convert price from THB to user's currency
      price: activity.price ? currencyService.convertFromTHB(activity.price, userCurrency) : null,
      b_price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
      // Add currency info for display
      currency: userCurrency
    }));
  }
};

export default activityService;
