
import { Database } from "@/integrations/supabase/types"

export type Activity = Database["public"]["Tables"]["activities"]["Row"] & {
  final_price?: number;
  video_url?: string | null;
  video_duration?: number | null;
  video_size?: number | null;
  video_thumbnail_url?: string | null;
  title?: string; // For backward compatibility
  id?: string; // For backward compatibility
  image_url?: string; // For backward compatibility
  pickup_location?: string; // For backward compatibility
  dropoff_location?: string; // For backward compatibility
  meeting_point?: string; // For backward compatibility
  languages?: string[]; // For backward compatibility
  highlights?: string[]; // For backward compatibility
  included?: string[]; // For backward compatibility
  not_included?: string[]; // For backward compatibility
  is_active?: boolean; // For backward compatibility
  b_price?: number; // For backward compatibility
  discounts?: any[]; // For backward compatibility
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
