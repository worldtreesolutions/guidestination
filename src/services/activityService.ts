
import { supabase } from "@/integrations/supabase/client";

export interface Activity {
  id: number;
  title: string;
  description: string;
  b_price: number;
  final_price: number;
  image_url: string;
  duration: string;
  max_participants: number;
  category_id: number;
  provider_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  highlights?: string;
  included?: string;
  not_included?: string;
}

export interface ActivitySelectedOption {
  id: number;
  activity_id: number;
  option_id: number;
  created_at: string;
  activity_options?: {
    label: string;
    type: string;
    category: string;
  };
}

export interface ActivityScheduleInstance {
  id: number;
  activity_id: number;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  available_spots: number;
  capacity: number;
  booked_count: number;
  is_active: boolean;
  status: string;
  price: number;
  created_at: string;
}

export const activityService = {
  async getActivityById(id: number): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching activity:', error);
      return null;
    }
    return data;
  },

  async getActivitySelectedOptions(activityId: number): Promise<ActivitySelectedOption[]> {
    const { data, error } = await supabase
      .from('activity_selected_options')
      .select(`
        *,
        activity_options (
          label,
          type,
          category
        )
      `)
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching activity options:', error);
      return [];
    }
    return data || [];
  },

  async getActivityScheduleInstances(activityId: number): Promise<ActivityScheduleInstance[]> {
    const { data, error } = await supabase
      .from('activity_schedule_instances')
      .select('*')
      .eq('activity_id', activityId)
      .eq('is_active', true)
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching activity schedule:', error);
      return [];
    }
    return data || [];
  },

  async getActivityWithDetails(id: number) {
    const [activity, selectedOptions, scheduleInstances] = await Promise.all([
      this.getActivityById(id),
      this.getActivitySelectedOptions(id),
      this.getActivityScheduleInstances(id)
    ]);

    return {
      activity,
      selectedOptions,
      scheduleInstances
    };
  }
};

export default activityService;
