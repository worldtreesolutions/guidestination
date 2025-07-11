
import { Database } from "@/integrations/supabase/types"

export type SupabaseActivity = Database["public"]["Tables"]["activities"]["Row"]
export type ActivityScheduleInstance = Database["public"]["Tables"]["activity_schedule_instances"]["Row"]
export type ActivitySelectedOption = Database["public"]["Tables"]["activity_selected_options"]["Row"] & {
  activity_options: Database["public"]["Tables"]["activity_options"]["Row"] | null
}
export type ActivityMedia = Database["public"]["Tables"]["activity_media"]["Row"];

export type Activity = SupabaseActivity & {
  schedule_instances: ActivityScheduleInstance[]
  selected_options: ActivitySelectedOption[]
  category_name?: string;
  image_urls?: string[];
  schedules?: any;
  rating?: number;
  location?: string;
  booking_type?: string;
  media?: ActivityMedia[];
  average_rating?: number;
  address?: string;
};

export type ScheduledActivity = Activity & {
  date: string;
  time: string;
  day?: string;
  hour?: number | string;
};

export type SupabaseBooking = Database["public"]["Tables"]["bookings"]["Row"];
export type Booking = SupabaseBooking & {
  activities: SupabaseActivity;
};

export type Earning = {
  month: string;
  total_earnings: number;
};

export type ActivityForHomepage = {
  id: number;
  title: string;
  image_url: string;
  price: number;
  location: string;
  category_name: string;
  rating: number;
  address: string | null;
  average_rating: number | null;
  b_price: number | null;
};

export type RecommendedActivity = SupabaseActivity & {
  similarity: number;
};
