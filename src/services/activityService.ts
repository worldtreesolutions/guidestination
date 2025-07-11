import { supabase } from "@/integrations/supabase/client";
import { Activity, ActivityForHomepage, SupabaseActivity } from "@/types/activity";

// Temporary inline currency conversion to avoid circular dependency
const getUserCurrency = (): string => {
  try {
    if (typeof window !== "undefined") {
      try {
        const locale = navigator.language || "en-US";
        const countryCode = locale.split("-")[1];
        const COUNTRY_CURRENCY_MAP: Record<string, string> = {
          US: "USD", CA: "CAD", GB: "GBP", AU: "AUD", NZ: "NZD",
          DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR",
          JP: "JPY", CN: "CNY", KR: "KRW", SG: "SGD", TH: "THB",
        };
        if (countryCode && COUNTRY_CURRENCY_MAP[countryCode]) {
          return COUNTRY_CURRENCY_MAP[countryCode];
        }
      } catch (error) {
        console.warn("Browser locale detection failed:", error);
      }
    }
    return "USD";
  } catch (error) {
    console.error("Error getting user currency:", error);
    return "USD";
  }
};

const convertFromTHB = (amountInTHB: number, targetCurrency: string): number => {
  const CURRENCY_RATES: Record<string, number> = {
    THB: 1, USD: 0.028, EUR: 0.026, GBP: 0.022, JPY: 4.2,
    CNY: 0.20, KRW: 38.5, SGD: 0.038, AUD: 0.043, CAD: 0.038,
  };
  const rate = CURRENCY_RATES[targetCurrency] || CURRENCY_RATES.USD;
  return Math.round((amountInTHB * rate) * 100) / 100;
};

const toActivity = (activity: SupabaseActivity, userCurrency: string): Activity => {
  const splitString = (str: string | null): string[] | null => {
    if (!str || str.trim() === '') return null;
    return str.split(',').map(s => s.trim());
  };

  // Convert b_price from string to number if needed
  const bPrice = typeof activity.b_price === 'string' ? parseFloat(activity.b_price) : activity.b_price;

  return {
    ...activity,
    slug: `activity-${activity.id}`,
    category_name: activity.category,
    price: bPrice ? convertFromTHB(bPrice, userCurrency) : null,
    currency: userCurrency,
    highlights: splitString(activity.highlights),
    languages: splitString(activity.languages),
    included: splitString(activity.included),
    not_included: splitString(activity.not_included),
    dynamic_highlights: [],
    dynamic_included: [],
    dynamic_not_included: [],
    activity_schedules: [],
    schedule_instances: [],
  };
};

export const activityService = {
  async getActivities(): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activities:", error);
        throw error;
      }

      const userCurrency = getUserCurrency();
      
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

      const userCurrency = getUserCurrency();

      return (data || []).map(activity => {
        const bPrice = typeof activity.b_price === 'string' ? parseFloat(activity.b_price) : activity.b_price;
        const convertedPrice = bPrice ? convertFromTHB(bPrice, userCurrency) : null;

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
        console.error("Invalid activity slug:", slug);
        return null;
      }
      
      console.log("Fetching activity with ID:", activityId);
      
      // Fetch activity data
      const { data: activityData, error: activityError } = await supabase
        .from("activities")
        .select("*")
        .eq("id", activityId)
        .eq("is_active", true)
        .single();

      if (activityError || !activityData) {
        console.error("Error fetching activity:", activityError);
        return null;
      }

      // Fetch schedules
      const { data: schedules } = await supabase
        .from("activity_schedules")
        .select("*")
        .eq("activity_id", activityId);

      // Fetch schedule instances
      const { data: scheduleInstances } = await supabase
        .from("activity_schedule_instances")
        .select("*")
        .eq("activity_id", activityId);

      // Fetch selected options with activity options
      const { data: selectedOptions } = await supabase
        .from("activity_selected_options")
        .select(`
          option_id,
          activity_options(
            id,
            label,
            icon,
            type
          )
        `)
        .eq("activity_id", activityId);

      const userCurrency = getUserCurrency();
      const activity = toActivity(activityData, userCurrency);

      // Process dynamic options
      const processOptions = (type: string) => {
        if (!selectedOptions) return [];
        return selectedOptions
          .filter(opt => opt.activity_options && opt.activity_options.type === type)
          .map(opt => ({
            id: opt.activity_options.id,
            label: opt.activity_options.label || '',
            icon: opt.activity_options.icon || 'Star',
            type: opt.activity_options.type
          }));
      };

      // Add dynamic data
      activity.dynamic_highlights = processOptions('highlight');
      activity.dynamic_included = processOptions('included');
      activity.dynamic_not_included = processOptions('not_included');
      activity.activity_schedules = schedules || [];
      activity.schedule_instances = scheduleInstances || [];

      console.log("Successfully fetched activity:", activity.title);
      return activity;
    } catch (error) {
      console.error("Error in getActivityBySlug:", error);
      return null;
    }
  },

  async getActivityById(activityId: number): Promise<Activity | null> {
    try {
      const { data: activityData, error: activityError } = await supabase
        .from("activities")
        .select("*")
        .eq("id", activityId)
        .eq("is_active", true)
        .single();

      if (activityError || !activityData) {
        console.error("Error fetching activity:", activityError);
        return null;
      }

      const userCurrency = getUserCurrency();
      return toActivity(activityData, userCurrency);
    } catch (error) {
      console.error("Error in getActivityById:", error);
      return null;
    }
  },

  async getActivitiesByCategory(categoryName: string): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("category", categoryName)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activities by category:", error);
        throw error;
      }

      const userCurrency = getUserCurrency();
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
        .select("*")
        .eq("is_active", true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error searching activities:", error);
        throw error;
      }

      const userCurrency = getUserCurrency();
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
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activities by owner:", error);
        throw error;
      }

      const userCurrency = getUserCurrency();
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
