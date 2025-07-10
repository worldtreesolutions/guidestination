export interface SupabaseActivity {
  id: number;
  title: string;
  name: string;
  description: string | null;
  price: number | null;
  location: string | null;
  image_url: string[] | null;
  image_urls: string[] | null;
  category_id: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  duration: number | null;
  max_participants: number | null;
  min_participants: number | null;
  is_active: boolean | null;
  languages: string[] | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  additional_info: string | null;
  booking_type: string | null;
  category_name: string;
  review_count: number | null;
  rating: number | null;
  included: string[] | null;
  not_included: string[] | null;
  highlights: string[] | null;
  meeting_point: string | null;
  includes_pickup: boolean | null;
  pickup_locations: string | null;
  includes_meal: boolean | null;
  meal_description: string | null;
  schedule: {
    availableDates?: string[];
    availableDays?: string[];
    startTime?: string;
    endTime?: string;
    operatingHours?: { day: string; time: string }[];
  } | null;
  schedules?: {
    availableDates?: string[];
  };
}

export interface SupabaseBooking {
  id: string;
  activity_id: number;
  user_id: string;
  booking_date: string;
  participants: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
  activityTitle: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  providerAmount: number;
  platformFee: number;
  totalAmount: number;
}