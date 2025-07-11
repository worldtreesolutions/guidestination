import { supabase } from "@/integrations/supabase/client";
import { Activity, SupabaseActivity, ActivitySchedule, ActivityScheduleInstance, TablesInsert, TablesUpdate } from "@/types/activity";

class ActivityService {
  private _mapStatus(status: number | null): string {
    switch (status) {
      case 1:
        return "published";
      case 2:
        return "unpublished";
      case 3:
        return "draft";
      case 4:
        return "archived";
      default:
        return "draft";
    }
  }

  private _transformActivity(
    activity: SupabaseActivity,
    categoryName?: string
  ): Activity {
    const {
      highlights,
      languages,
      included,
      not_included,
      status,
      duration,
      ...rest
    } = activity;

    return {
      ...rest,
      slug: activity.title.toLowerCase().replace(/\s+/g, "-"),
      category_name: categoryName || "Uncategorized",
      price: activity.b_price,
      currency: "THB",
      highlights: highlights ? JSON.parse(highlights) : [],
      languages: languages ? JSON.parse(languages) : ["English"],
      included: included ? JSON.parse(included) : [],
      not_included: not_included ? JSON.parse(not_included) : [],
      status: this._mapStatus(status),
      duration: duration ? parseInt(duration, 10) : null,
    };
  }

  async getActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*, categories(name)")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }

    return data.map((activity) =>
      this._transformActivity(activity as any, (activity as any).categories?.name)
    );
  }

  async getActivityById(id: number): Promise<Activity> {
    const {  activity, error } = await supabase
      .from("activities")
      .select("*, categories(name)")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!activity) throw new Error("Activity not found");

    const schedulesResponse = await supabase
      .from("activity_schedules")
      .select("*")
      .eq("activity_id", id);

    const scheduleInstancesResponse = await supabase
      .from("activity_schedule_instances")
      .select("*")
      .eq("activity_id", id);

    const transformedActivity = this._transformActivity(
      activity as any,
      (activity as any).categories?.name
    );

    return {
      ...transformedActivity,
      schedules: (schedulesResponse.data as ActivitySchedule[]) || [],
      schedule_instances: scheduleInstancesResponse.data || [],
    };
  }

  async getActivityBySlug(slug: string): Promise<Activity | null> {
    const { data, error } = await supabase
      .from("activities")
      .select("*, categories(name)")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }

    const activity = data.find(
      (act) => act.title.toLowerCase().replace(/\s+/g, "-") === slug
    );

    if (!activity) return null;

    return this.getActivityById(activity.id);
  }

  async fetchActivitiesByOwner(ownerId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*, categories(name)")
      .eq("provider_id", ownerId);

    if (error) throw error;

    return data.map((activity) =>
      this._transformActivity(activity as any, (activity as any).categories?.name)
    );
  }

  async createActivity(
    activityData: TablesInsert<"activities">
  ): Promise<SupabaseActivity> {
    const { data, error } = await supabase
      .from("activities")
      .insert(activityData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateActivity(
    id: number,
    activityData: TablesUpdate<"activities">
  ): Promise<SupabaseActivity> {
    const { data, error } = await supabase
      .from("activities")
      .update(activityData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteActivity(id: number): Promise<void> {
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) throw error;
  }

  async getSchedulesForActivity(activityId: number): Promise<ActivitySchedule[]> {
    const { data, error } = await supabase
      .from("activity_schedules")
      .select("*")
      .eq("activity_id", activityId);
    if (error) throw error;
    return data as ActivitySchedule[];
  }

  async updateSchedulesForActivity(
    activityId: number,
    schedules: Partial<ActivitySchedule>[]
  ): Promise<ActivitySchedule[]> {
    const schedulesToUpsert = schedules.map((s) => ({
      ...s,
      activity_id: activityId,
    }));

    const { data, error } = await supabase
      .from("activity_schedules")
      .upsert(schedulesToUpsert)
      .select();

    if (error) throw error;
    return data as ActivitySchedule[];
  }

  async getScheduleInstances(
    activityId: number,
    startDate: string,
    endDate: string
  ): Promise<ActivityScheduleInstance[]> {
    const { data, error } = await supabase
      .from("activity_schedule_instances")
      .select("*")
      .eq("activity_id", activityId)
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate);

    if (error) throw error;
    return data;
  }
}

const activityService = new ActivityService();
export default activityService;
