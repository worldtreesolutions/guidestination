
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
}

export interface ActivitySelectedOption {
  id: number;
  activity_id: number;
  option_type: 'highlight' | 'included' | 'not_included';
  option_text: string;
  created_at: string;
}

export interface ActivitySchedule {
  id: number;
  activity_id: number;
  date: string;
  start_time: string;
  end_time: string;
  available_spots: number;
  is_available: boolean;
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
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching activity options:', error);
      return [];
    }
    return data || [];
  },

  async getActivitySchedule(activityId: number): Promise<ActivitySchedule[]> {
    const { data, error } = await supabase
      .from('activity_schedule')
      .select('*')
      .eq('activity_id', activityId)
      .eq('is_available', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching activity schedule:', error);
      return [];
    }
    return data || [];
  },

  async getActivityWithDetails(id: number) {
    const [activity, selectedOptions, schedule] = await Promise.all([
      this.getActivityById(id),
      this.getActivitySelectedOptions(id),
      this.getActivitySchedule(id)
    ]);

    return {
      activity,
      selectedOptions,
      schedule
    };
  }
};

export default activityService;
