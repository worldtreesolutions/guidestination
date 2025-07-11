
    
import { supabase } from "@/integrations/supabase/client"
import {
  Activity,
  ActivityScheduleInstance,
  ActivitySelectedOption,
  SupabaseActivity,
} from "@/types/activity"
import { Database } from "@/integrations/supabase/types"

type ActivityWithOptionsAndSchedule =
  Database["public"]["Tables"]["activities"]["Row"] & {
    activity_selected_options: (Database["public"]["Tables"]["activity_selected_options"]["Row"] & {
      activity_options: Database["public"]["Tables"]["activity_options"]["Row"]
    })[]
    activity_schedule_instances: Database["public"]["Tables"]["activity_schedule_instances"]["Row"][]
  }

const activityService = {
  async getAllActivities(): Promise<SupabaseActivity[]> {
    const { data, error } = await supabase.from("activities").select("*")

    if (error) {
      console.error("Error fetching activities:", error)
      return []
    }

    return data || []
  },

  async getActivityById(id: number): Promise<Activity | null> {
    const { data, error } = await supabase
      .from("activities")
      .select(
        `
        *,
        activity_selected_options:activity_selected_options!inner (
          *,
          activity_options (*)
        ),
        activity_schedule_instances (*)
      `
      )
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching activity:", error)
      return null
    }

    const activityData = data as ActivityWithOptionsAndSchedule

    return {
      ...activityData,
      selected_options: activityData.activity_selected_options,
      schedule_instances: activityData.activity_schedule_instances,
    }
  },

  async getSelectedOptionsByActivityId(
    activityId: number
  ): Promise<ActivitySelectedOption[]> {
    const { data, error } = await supabase
      .from("activity_selected_options")
      .select(
        `
        *,
        activity_options (*)
      `
      )
      .eq("activity_id", activityId)

    if (error) {
      console.error("Error fetching selected options:", error)
      return []
    }
    return data as ActivitySelectedOption[]
  },

  async getScheduleInstancesByActivityId(
    activityId: number
  ): Promise<ActivityScheduleInstance[]> {
    const { data, error } = await supabase
      .from("activity_schedule_instances")
      .select("*")
      .eq("activity_id", activityId)
      .order("scheduled_date", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching schedule instances:", error)
      return []
    }
    return data
  },
}

export default activityService
  