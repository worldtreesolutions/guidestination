
import { Database } from "@/integrations/supabase/types"

export type Activity = Database["public"]["Tables"]["activities"]["Row"] & {
  final_price?: number;
  video_url?: string | null;
  video_duration?: number | null;
  video_size?: number | null;
  video_thumbnail_url?: string | null;
  meeting_point?: string | null;
  languages?: string[] | null;
  highlights?: string[] | null;
  included?: string[] | null;
  not_included?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type ActivityStatus = "draft" | "published" | "archived"

export interface ActivitySchedule {
  id: string;
  activity_id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  availability_start_date: string;
  availability_end_date: string;
  created_at: string;
  updated_at: string;
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
