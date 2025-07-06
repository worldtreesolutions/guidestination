
import { Database } from "@/integrations/supabase/types"

// The Activity type is now primarily derived from the database schema.
// Additional client-side properties can be added here if needed.
export type Activity = Database["public"]["Tables"]["activities"]["Row"] & {
  // Example of a client-side only property
  isFavorited?: boolean;
}

export type ActivityStatus = "draft" | "published" | "archived"

export type ActivitySchedule = Database["public"]["Tables"]["activity_schedules"]["Row"];

export interface ActivityFilters {
  status?: ActivityStatus;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}

export type ActivityMedia = Database["public"]["Tables"]["activity_media"]["Row"];
