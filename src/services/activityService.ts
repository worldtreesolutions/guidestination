import { supabase } from "@/integrations/supabase/client";
import { Activity, ActivityForHomepage, SupabaseActivity } from "@/types/activity";
import { currencyService } from "./currencyService";

const toActivity = (activity: SupabaseActivity & { activity_schedules?: any[]; activity_schedule_instances?: any[] }, userCurrency: string): Activity => {
  const splitString = (str: string | null): string[] | null => {
    if (str === null || typeof str === 'undefined') return null;
    if (str.trim() === '') return [];
    return str.split(',').map(s => s.trim());
  };

  // Convert b_price from string to number if needed
  const bPrice = typeof activity.b_price === 'string' ? parseFloat(activity.b_price) : activity.b_price;

  return {
    ...activity,
    slug: `activity-${activity.id}`,
    category_name: activity.category,
    price: bPrice ? currencyService.convertFromTHB(bPrice, userCurrency) : null,
    currency: userCurrency,
    highlights: splitString(activity.highlights),
    languages: splitString(activity.languages),
    included: splitString(activity.included),
    not_included: splitString(activity.not_included),
    activity_schedules: Array.isArray(activity.activity_schedules) ? activity.activity_schedules : [],
    schedule_instances: Array.isArray(activity.activity_schedule_instances) ? activity.activity_schedule_instances : [],
  };
};

export const activityService = {
  async getActivities(): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_schedules(*),
          activity_schedule_instances(*)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activities:", error);
        throw error;
      }

      const userCurrency = currencyService.getUserCurrency();
      
      return (data || []).map(activity => toActivity(activity, userCurrency));
    } catch (error) {
      console.error("Error in getActivities:", error);
      throw error;
    }
  },

  async getActivitiesForHomepage(): Promise<ActivityForHomepage[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          id,
          title,
          b_price,
          address,
          average_rating,
          image_url,
          category,
          duration,
          min_age,
          max_age,
          description,
          max_participants,
          technical_skill_level,
          physical_effort_level,
          includes_pickup,
          includes_meal
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching activities for homepage:", error);
        throw error;
      }

      const userCurrency = currencyService.getUserCurrency();

      return (data || []).map(activity => {
        // Convert b_price from string to number if needed
        const bPrice = typeof activity.b_price === 'string' ? parseFloat(activity.b_price) : activity.b_price;
        const convertedPrice = bPrice ? currencyService.convertFromTHB(bPrice, userCurrency) : null;

        return {
          ...activity,
          slug: `activity-${activity.id}`,
          category_name: activity.category,
          location: activity.address || "Location TBD",
          price: convertedPrice,
          b_price: convertedPrice,
          currency: userCurrency
        };
      });
    } catch (error) {
      console.error("Error in getActivitiesForHomepage:", error);
      throw error;
    }
  },

  async getActivityBySlug(slug: string): Promise<Activity | null> {
    try {
      const activityIdStr = slug.replace('activity-', '');
      const activityId = parseInt(activityIdStr, 10);

      if (isNaN(activityId)) {
        console.error("Invalid activity slug, could not parse ID:", slug);
        return null;
      }
      
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_schedules(*),
          activity_schedule_instances(*)
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
    } catch (error) {
      console.error("Error in getActivityBySlug:", error);
      return null;
    }
  },

  async getActivityById(activityId: number): Promise<Activity | null> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_schedules(*),
          activity_schedule_instances(*)
        `)
        .eq("id", activityId)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching activity by ID:", error);
        return null;
      }

      if (!data) return null;

      const userCurrency = currencyService.getUserCurrency();

      return toActivity(data, userCurrency);
    } catch (error) {
      console.error("Error in getActivityById:", error);
      return null;
    }
  },

  async getActivitiesByCategory(categoryName: string): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_schedules(*),
          activity_schedule_instances(*)
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
    } catch (error) {
      console.error("Error in getActivitiesByCategory:", error);
      throw error;
    }
  },

  async searchActivities(query: string): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_schedules(*),
          activity_schedule_instances(*)
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
    } catch (error) {
      console.error("Error in searchActivities:", error);
      throw error;
    }
  },

  async fetchActivitiesByOwner(ownerId: string): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_schedules(*),
          activity_schedule_instances(*)
        `)
        .eq("owner_id", ownerId) // Assuming 'owner_id' column exists
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activities by owner:", error);
        throw error;
      }

      const userCurrency = currencyService.getUserCurrency();
      
      return (data || []).map(activity => toActivity(activity, userCurrency));
    } catch (error) {
      console.error("Error in fetchActivitiesByOwner:", error);
      throw error;
    }
  },

  async deleteActivity(activityId: number): Promise<{ error: any | null }> {
    try {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId);

      if (error) {
        console.error("Error deleting activity:", error);
      }
      return { error };
    } catch (error) {
      console.error("Error in deleteActivity:", error);
      return { error };
    }
  }
};

export default activityService;
