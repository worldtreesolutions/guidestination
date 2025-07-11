
import { supabase } from "@/integrations/supabase/client";
import { Activity, ActivityForHomepage, SupabaseActivity } from "@/types/activity";
import { currencyService } from "./currencyService";

const toActivity = (activity: SupabaseActivity & { activity_schedules?: any[] }, userCurrency: string): Activity => {
  const splitString = (str: string | null): string[] | null => {
    if (str === null || typeof str === 'undefined') return null;
    if (str.trim() === '') return [];
    return str.split(',').map(s => s.trim());
  };

  return {
    ...activity,
    slug: `activity-${activity.id}`,
    category_name: activity.category,
    price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
    currency: userCurrency,
    highlights: splitString(activity.highlights),
    languages: splitString(activity.languages),
    included: splitString(activity.included),
    not_included: splitString(activity.not_included),
    activity_schedules: activity.activity_schedules || [],
  };
};

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

    const userCurrency = currencyService.getUserCurrency();
    
    return (data || []).map(activity => toActivity(activity, userCurrency));
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

    const userCurrency = currencyService.getUserCurrency();

    return (data || []).map(activity => ({
      ...activity,
      slug: `activity-${activity.id}`,
      category_name: activity.category,
      location: activity.address || "Location TBD",
      price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
      b_price: activity.b_price ? currencyService.convertFromTHB(activity.b_price, userCurrency) : null,
      currency: userCurrency
    }));
  },

  async getActivityBySlug(slug: string): Promise<Activity | null> {
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

    const userCurrency = currencyService.getUserCurrency();

    return toActivity(data, userCurrency);
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

    const userCurrency = currencyService.getUserCurrency();

    return (data || []).map(activity => toActivity(activity, userCurrency));
  },

  async searchActivities(query: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        activity_schedules(*)
      `)
      .eq("is_active", true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching activities:", error);
      throw error;
    }

    const userCurrency = currencyService.getUserCurrency();

    return (data || []).map(activity => toActivity(activity, userCurrency));
  }
};

export default activityService;
  