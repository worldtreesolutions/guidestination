import { Database } from "@/integrations/supabase/types"

export type Activity = Database["public"]["Tables"]["activities"]["Row"] & {
  final_price?: number;
  video_url?: string | null;
  video_duration?: number | null;
  video_size?: number | null;
  video_thumbnail_url?: string | null;
  meeting_point?: string | null;
  languages?: string | null; // Changed from string[] | null to match database
  highlights?: string | null;
  included?: string | null;
  not_included?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  id?: number; // Added for compatibility with ActivityCard
  price?: number; // Added for compatibility with ActivityCard
}

export type ActivityStatus = "draft" | "published" | "archived"

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
  status?: ActivityStatus;
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
