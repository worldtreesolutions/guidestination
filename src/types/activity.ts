export interface Activity {
  id: number;
  title: string;
  description: string;
  price_per_person: number;
  location: string;
  duration_hours: number;
  max_participants: number;
  provider_id: string;
  category_id: number;
  images?: string[];
  rating?: number;
  highlights?: string[];
  included?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  activity_id: number;
  user_id: number;
  booking_date: string;
  booking_time: string;
  booking_status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export type ActivityStatus = "draft" | "published" | "archived";
