
import type { Database } from "@/integrations/supabase/types";

// Base types from Supabase
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type ActivitySchedule = Database["public"]["Tables"]["activity_schedules"]["Row"];
export type BaseBooking = Database["public"]["Tables"]["bookings"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"] & {
  users: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};


// Extended / Custom types for the application
export type ActivityWithDetails = Activity & {
  categories: Category | null;
  activity_schedules: ActivitySchedule[];
  reviews: Review[];
  image_urls: string[];
};

export type ActivityForHomepage = Pick<
  Activity,
  "id" | "title" | "b_price" | "image_url" | "slug"
> & {
  category_name: string | null;
};

// Add properties that are not in the base table but are needed in the app
export type Booking = BaseBooking & {
  activities?: Activity;
};

export interface ScheduledActivity {
  id: string;
  title: string;
  day: string;
  time: string;
  activity: ActivityWithDetails;
}

// Other specific types
export interface TimeSlot {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}
    