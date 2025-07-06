export interface Activity {
  id: number;
  activity_id: number;
  title: string;
  name: string;
  description: string;
  final_price: number;
  price: number;
  b_price: number;
  Final_Price: number;
  category_id: number;
  is_active: boolean;
  status: "draft" | "published" | "archived";
  duration: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  location: string | null;
  max_participants: number | null;
  languages: string[] | null;
  highlights: string[] | null;
  included: string[] | null;
  not_included: string[] | null;
  meeting_point: string | null;
  average_rating: number | null;
  review_count: number | null;
  category: string | null;
  includes_pickup: boolean | null;
  pickup_locations: string | null;
  includes_meal: boolean | null;
  meal_description: string | null;
  provider_id: string | null;
  video_url?: string;
  video_duration?: string;
  images?: string[];
  videos?: { url: string; thumbnail?: string | null; duration?: number | null }[];
}

export type ActivityStatus = "draft" | "published" | "archived";
