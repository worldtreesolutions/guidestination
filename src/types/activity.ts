export interface SupabaseActivity {
  id: string;
  title: string;
  name: string;
  description: string | null;
  category: string;
  category_name: string;
  price: number | null;
  max_participants: number | null;
  duration: number | null;
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
    }[];
  };
}

export interface ActivityForHomepage {
  id: string;
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
  created_at: string;
  activity_id: string;
  user_id: string;
  status: string;
  total_price: number;
  activities: SupabaseActivity;
  activityTitle: string;
  customerName: string;
  customerEmail: string;
  date: string;
  bookingTime: string;
  participants: number;
  providerAmount: number;
  platformFee: number;
  totalAmount: number;
}

export interface Earning {
  total: number;
  month: string;
}
