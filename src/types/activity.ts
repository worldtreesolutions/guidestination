
    
import { Database } from "@/integrations/supabase/types"

export type SupabaseActivity = Database["public"]["Tables"]["activities"]["Row"]
export type ActivityScheduleInstance = Database["public"]["Tables"]["activity_schedule_instances"]["Row"]
export type ActivitySelectedOption = Database["public"]["Tables"]["activity_selected_options"]["Row"] & {
  activity_options: Database["public"]["Tables"]["activity_options"]["Row"] | null
}

export type Activity = SupabaseActivity & {
  schedule_instances: ActivityScheduleInstance[]
  selected_options: ActivitySelectedOption[]
}
  