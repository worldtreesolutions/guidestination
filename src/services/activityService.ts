import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { ActivityForHomepage, ActivityWithDetails, ActivitySchedule, Booking } from "@/types/activity";

const activityService = {
  async getActivitiesForHomepage(): Promise<ActivityForHomepage[]> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return [];
    }
    const { data, error } = await supabase
      .from("activities")
      .select("id, title, b_price, image_url, categories(name)")
      .limit(10);

    if (error) {
      console.error("Error fetching activities for homepage:", error);
      throw error;
    }

    return (data as any[]).map((activity) => ({
      ...activity,
      slug: `activity-${activity.id}`,
      category_name: activity.categories?.name || null,
    }));
  },

  async getActivities(): Promise<ActivityWithDetails[]> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return [];
    }
    const { data, error } = await supabase
      .from("activities")
      .select(
        `*,
        categories(*),
        activity_schedules(*),
        reviews(*, users(full_name, avatar_url))
        `
      );

    if (error) {
      console.error(`Error fetching activities:`, error);
      return [];
    }
    if (!data) {
        return [];
    }
    return data.map((activity: any) => ({
        ...activity,
        categories: activity.categories && !activity.categories.error ? activity.categories : null,
        activity_schedules: Array.isArray(activity.activity_schedules) ? activity.activity_schedules : [],
        reviews: Array.isArray(activity.reviews) ? activity.reviews : [],
    })) as ActivityWithDetails[];
  },

  async getActivityBySlug(slug: string): Promise<ActivityWithDetails | null> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return null;
    }
    
    // Extract ID from slug (format: activity-{id})
    const idMatch = slug.match(/activity-(\d+)/);
    if (!idMatch) {
      console.error(`Invalid slug format: ${slug}`);
      return null;
    }
    
    const activityId = parseInt(idMatch[1], 10);
    
    const { data, error } = await supabase
      .from("activities")
      .select(
        `*,
        categories(*),
        activity_schedules(*),
        reviews(*, users(full_name, avatar_url))
        `
      )
      .eq("id", activityId)
      .single();

    if (error) {
      console.error(`Error fetching activity by slug ${slug}:`, error);
      return null;
    }
    if (!data) {
        return null;
    }
    const activity: any = data;
    return {
        ...activity,
        categories: activity.categories && !activity.categories.error ? activity.categories : null,
        activity_schedules: Array.isArray(activity.activity_schedules) ? activity.activity_schedules : [],
        reviews: Array.isArray(activity.reviews) ? activity.reviews : [],
    } as ActivityWithDetails;
  },

  async getActivityById(id: number): Promise<ActivityWithDetails | null> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return null;
    }
    const { data, error } = await supabase
      .from("activities")
      .select(
        `*,
        categories(*),
        activity_schedules(*),
        reviews(*, users(full_name, avatar_url))
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching activity by id ${id}:`, error);
      return null;
    }
    if (!data) {
        return null;
    }
    const activity: any = data;
    return {
        ...activity,
        categories: activity.categories && !activity.categories.error ? activity.categories : null,
        activity_schedules: Array.isArray(activity.activity_schedules) ? activity.activity_schedules : [],
        reviews: Array.isArray(activity.reviews) ? activity.reviews : [],
    } as ActivityWithDetails;
  },

  async getActivitiesByProvider(providerId: string): Promise<any[]> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return [];
    }
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("provider_id", providerId);

    if (error) {
      console.error("Error fetching activities by provider:", error);
      return [];
    }
    return data;
  },

  async createActivity(activityData: any): Promise<any> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const { data, error } = await supabase
      .from("activities")
      .insert([activityData])
      .select()
      .single();

    if (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
    return data;
  },

  async updateActivity(activityId: number, activityData: any): Promise<any> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const { data, error } = await supabase
      .from("activities")
      .update(activityData)
      .eq("id", activityId)
      .select()
      .single();

    if (error) {
      console.error("Error updating activity:", error);
      throw error;
    }
    return data;
  },

  async deleteActivity(activityId: number): Promise<any> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const { data, error } = await supabase
      .from("activities")
      .delete()
      .eq("id", activityId);

    if (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
    return data;
  },

  async getActivitySchedules(activityId: number): Promise<ActivitySchedule[]> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return [];
    }
    const { data, error } = await supabase
      .from("activity_schedules")
      .select("*")
      .eq("activity_id", activityId);

    if (error) {
      console.error("Error fetching activity schedules:", error);
      return [];
    }
    return data;
  },

  async updateActivitySchedules(activityId: number, schedules: Partial<ActivitySchedule>[]): Promise<any> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    // Separate schedules into new and existing
    const newSchedules = schedules.filter((s) => !s.id);
    const existingSchedules = schedules.filter((s) => s.id);

    // Upsert existing schedules
    if (existingSchedules.length > 0) {
      const { error: updateError } = await supabase
        .from("activity_schedules")
        .upsert(existingSchedules as any);
      if (updateError) {
        console.error("Error updating existing schedules:", updateError);
        throw updateError;
      }
    }

    // Insert new schedules
    if (newSchedules.length > 0) {
        const schedulesToInsert = newSchedules.map(s => ({...s, activity_id: activityId, day_of_week: s.day_of_week as number, start_time: s.start_time as string, end_time: s.end_time as string}));
        const { error: insertError } = await supabase
        .from("activity_schedules")
        .insert(schedulesToInsert);
      if (insertError) {
        console.error("Error inserting new schedules:", insertError);
        throw insertError;
      }
    }

    return { success: true };
  },

  async bookActivity(bookingData: Omit<Booking, "id" | "created_at" | "status">): Promise<Booking> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const { data, error } = await supabase
      .from("bookings")
      .insert([{ ...bookingData, status: "pending" }])
      .select()
      .single();

    if (error) {
      console.error("Error booking activity:", error);
      throw error;
    }
    return data as Booking;
  },

  async fetchActivitiesByOwner(ownerId: string): Promise<ActivityWithDetails[]> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return [];
    }
    const { data, error } = await supabase
      .from("activities")
      .select(
        `*,
        categories(*),
        activity_schedules(*),
        reviews(*, users(full_name, avatar_url))
        `
      )
      .eq("provider_id", ownerId);

    if (error) {
      console.error("Error fetching activities by owner:", error);
      return [];
    }
    if (!data) {
        return [];
    }
    return data.map((activity: any) => ({
        ...activity,
        categories: activity.categories && !activity.categories.error ? activity.categories : null,
        activity_schedules: Array.isArray(activity.activity_schedules) ? activity.activity_schedules : [],
        reviews: Array.isArray(activity.reviews) ? activity.reviews : [],
    })) as ActivityWithDetails[];
  },
};

export default activityService;
