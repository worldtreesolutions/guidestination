
import { Database } from "@/integrations/supabase/types";

// Helper type to extract row types from the Database type.
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

// Base types from Supabase schema
export type SupabaseActivity = Tables<"activities">;
export type SupabaseBooking = Tables<"bookings">;
export type SupabaseActivitySchedule = Tables<"activity_schedules">;
export type ActivityScheduleInstance = Tables<"activity_schedule_instances">;
export type ActivitySelectedOption = Tables<"activity_selected_options">;
export type ActivityOwner = Tables<"activity_owners">;
export type CommissionInvoice = Tables<"commission_invoices">;
export type CommissionPayment = Tables<"commission_payments">;
export type Provider = Tables<"activity_owners">; // Alias for ActivityOwner

// Utility type for booking status
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

// Enriched types for application use
export interface Activity extends SupabaseActivity {
  category_name?: string;
  media?: { url: string; type: "image" | "video" }[];
  schedules?: SupabaseActivitySchedule[];
  name?: string; // Fallback for title
  duration?: number | null;
  max_participants?: number | null;
  meeting_point?: string | null;
  highlights?: string[] | null;
  languages?: string[] | null;
  included?: string[] | null;
  not_included?: string[] | null;
  includes_pickup?: boolean | null;
  pickup_locations?: string | null;
  includes_meal?: boolean | null;
  meal_description?: string | null;
  activity_schedules?: ActivitySchedule[];
  currency?: string;
}

export interface Booking extends Omit<SupabaseBooking, "status"> {
  status: BookingStatus | null;
  activities: SupabaseActivity | null;
  platform_fee?: number;
  provider_amount?: number;
}

// Slimmed-down type for homepage activity cards
export interface ActivityForHomepage {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  b_price: number | null;
  location: string;
  address: string;
  average_rating: number | null;
  image_url: string | null;
  category_name?: string;
  currency?: string;
}

// Type for earnings data visualization
export type Earning = {
  month: string;
  amount: number;
};

export type EarningsData = {
  total: number;
  monthly: Earning[];
  pending: number;
};

// Specific type for recent bookings list in the dashboard
export type RecentBooking = {
  id: string;
  customer_name: string | null;
  total_price: number | null;
  booking_date: string;
  status: BookingStatus | null;
  activity_title: string | null;
};

// Type for commission statistics
export type CommissionStats = {
  totalInvoices: number;
  totalCommissionAmount: number;
  paidInvoices: number;
  totalPaidAmount: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalPendingAmount: number;
};

// Type for activities scheduled in the planner
export interface ScheduledActivity extends Activity {
  date: Date;
  time: string;
}

export interface ActivitySchedule {
  id: string;
  activity_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_participants: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityBooking {
  id: string;
  activity_id: string;
  user_id: string;
  booking_date: string;
  participants: number;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status: "pending" | "paid" | "refunded";
  created_at: string;
  updated_at: string;
}

export interface ActivityReview {
  id: string;
  activity_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
}
