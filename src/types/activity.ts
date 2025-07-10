
export interface SupabaseActivity {
  id: number;
  title: string;
  name: string;
  description: string | null;
  category: string;
  category_name: string;
  price: number | null;
  max_participants: number | null;
  duration: number | null;
  min_age: number | null;
  max_age: number | null;
  physical_effort_level: string | null;
  technical_skill_level: string | null;
  location: string | null;
  meeting_point: string | null;
  includes_pickup: boolean;
  pickup_locations: string | null;
  includes_meal: boolean;
  meal_description: string | null;
  highlights: string[] | null;
  included: string[] | null;
  not_included: string[] | null;
  languages: string[] | null;
  rating: number | null;
  review_count: number | null;
  image_urls: string[] | null;
  video_url: string | null;
  provider_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  schedules: {
    availableDates: {
      date: string;
      startTime: string;
      endTime: string;
      capacity: number;
      booked: number;
      available: number;
      price?: number;
    }[];
  };
  selectedOptions?: {
    id: number;
    label: string;
    icon: string;
    type: string;
    category: string;
  }[];
  status?: "published" | "unpublished" | "draft" | "archived";
  booking_type?: "daily" | "hourly";
}

export interface ActivityForHomepage {
  id: number;
  title: string;
  name: string;
  description: string | null;
  category: string;
  category_name: string;
  price: number | null;
  rating: number | null;
  review_count: number | null;
  image_url: string;
  image_urls: string[] | null;
  location: string | null;
  duration: number | null;
  provider_id: string;
}

export interface SupabaseBooking {
  id: string;
  activity_id: number;
  user_id: string;
  booking_date: string;
  status: string;
  num_participants: number;
  total_price: number;
  created_at: string;
}

export interface Booking extends SupabaseBooking {
  activityTitle?: string;
  customerName?: string;
  customerEmail?: string;
  date?: string;
  bookingTime?: string;
  providerAmount?: number;
  platformFee?: number;
  totalAmount?: number;
  activities?: {
    title: string;
  };
}

export interface Earning {
  total: number;
  monthly: { month: string; amount: number }[];
  pending: number;
}
  