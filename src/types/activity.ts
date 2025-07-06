import { Database } from "@/integrations/supabase/types"

// Ensure Activity type aligns with Database["public"]["Tables"]["activities"]["Row"]
export type Activity = Database["public"]["Tables"]["activities"]["Row"] & {
  // These are additional client-side properties or aliases
  price?: number; // Alias for b_price or final_price for card components
  video_url?: string | null;
  video_duration?: number | null;
  video_size?: number | null;
  video_thumbnail_url?: string | null;
  // meeting_point is already in Database["public"]["Tables"]["activities"]["Row"]
  // languages is already in Database["public"]["Tables"]["activities"]["Row"]
  // highlights is already in Database["public"]["Tables"]["activities"]["Row"]
  // included is already in Database["public"]["Tables"]["activities"]["Row"]
  // not_included is already in Database["public"]["Tables"]["activities"]["Row"]
  // latitude and longitude might be location_lat, location_lng from DB
  // id is already in Database["public"]["Tables"]["activities"]["Row"] as number (PK)
  // final_price is already in Database["public"]["Tables"]["activities"]["Row"] as final_price (number | null)
}

export type ActivityStatus = "draft" | "published" | "archived" // This can be used for string representations if needed

export interface ActivitySchedule {
  id?: number;
  activity_id: number | null;
  start_time: string;
  end_time: string;
  capacity: number;
  created_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  availability_start_date: string | null;
  availability_end_date: string | null;
  is_active: boolean | null;
  status: string | null;
}

export interface ActivityFilters {
  status?: ActivityStatus; // Can use the string status type here
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}

export interface ActivityMedia {
  url: string;
  type: "image" | "video";
  thumbnail_url?: string;
  duration?: number;
  size?: number;
}

// REMOVE THE DUPLICATE Activity INTERFACE
// export interface Activity {
//   id: number
//   activity_id: number
//   title: string
//   name: string
//   description: string
//   final_price: number
//   price: number
//   b_price: number
//   Final_Price: number
//   category_id: number
//   is_active: boolean
//   status: "draft" | "published" | "archived"
//   duration: string
//   image_url: string
//   created_at: string
//   updated_at: string
// }
