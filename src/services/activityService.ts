
import { supabase } from "@/integrations/supabase/client";
import {
  Activity,
  SupabaseActivity,
  ActivityForHomepage,
  ActivitySelectedOption,
  ActivityScheduleInstance,
} from "@/types/activity";

export const activityService = {
  // Fetch all active activities with their category name
  async getActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select(
        `
        *,
        categories (
          name
        )
      `
      )
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }

    return data.map((activity: any) => ({
      ...activity,
      category_name: activity.categories?.name,
    })) as Activity[];
  },

  // Fetch a single activity by its ID, ensuring it's active
  async getActivityById(id: number): Promise<Activity | null> {
    const { data, error } = await supabase
      .from("activities")
      .select(
        `
        *,
        categories (
          name
        ),
        activity_schedules (*)
      `
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error(`Error fetching activity with id ${id}:`, error);
      return null;
    }
    if (!data) return null;

    return {
      ...data,
      category_name: (data.categories as any)?.name,
      schedules: data.activity_schedules,
    } as Activity;
  },

  // Fetch selected options for a booking
  async getSelectedOptionsForBooking(
    bookingId: string
  ): Promise<ActivitySelectedOption[]> {
    const { data, error } = await supabase
      .from("activity_selected_options")
      .select("*")
      .eq("booking_id", bookingId);

    if (error) throw error;
    return data as ActivitySelectedOption[];
  },

  // Fetch schedule instances for an activity
  async getScheduleInstances(
    activityId: number
  ): Promise<ActivityScheduleInstance[]> {
    const { data, error } = await supabase
      .from("activity_schedule_instances")
      .select("*")
      .eq("activity_id", activityId);

    if (error) throw error;
    return data as ActivityScheduleInstance[];
  },

  // Fetch activities for the homepage (slimmed down version)
  async getHomepageActivities(): Promise<ActivityForHomepage[]> {
    const { data, error } = await supabase
      .from("activities")
      .select(
        `
        id,
        title,
        price,
        b_price,
        location,
        address,
        average_rating,
        image_url,
        categories (
          name
        )
      `
      )
      .eq("is_active", true)
      .limit(10);

    if (error) {
      console.error("Error fetching homepage activities:", error);
      throw error;
    }

    return data.map((activity: any) => ({
      ...activity,
      category_name: activity.categories?.name,
    })) as ActivityForHomepage[];
  },
};

export default activityService;
