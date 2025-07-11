import { Database } from "@/integrations/supabase/types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type SupabaseActivity = Tables<"activities">;
export type SupabaseBooking = Tables<"bookings">;
export type SupabaseActivitySchedule = Tables<"activity_schedules">;
export type ActivityScheduleInstance = Tables<"activity_schedule_instances">;
export type ActivitySelectedOption = Tables<"activity_selected_options">;
export type ActivityOwner = Tables<"activity_owners">;
export type CommissionInvoice = Tables<"commission_invoices">;
export type CommissionPayment = Tables<"commission_payments">;
export type Provider = Tables<"activity_owners">;

export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

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

export interface ActivityOption {
  id: number;
  label: string;
  icon: string;
  type: string;
}

export interface Activity extends Omit<SupabaseActivity, "highlights" | "languages" | "included" | "not_included" | "status" | "duration"> {
  slug?: string;
  category_name?: string;
  price?: number | null;
  currency?: string;
  media?: { url: string; type: "image" | "video" }[];
  schedules?: SupabaseActivitySchedule[];
  highlights: string[] | null;
  languages: string[] | null;
  included: string[] | null;
  not_included: string[] | null;
  dynamic_highlights?: ActivityOption[];
  dynamic_included?: ActivityOption[];
  dynamic_not_included?: ActivityOption[];
  activity_schedules?: ActivitySchedule[];
  schedule_instances?: ActivityScheduleInstance[];
  includes_guide?: boolean | null;
  includes_equipment?: boolean | null;
  location?: string | null;
  status?: string;
  review_count?: number;
  average_rating: number | null;
  duration?: number | null;
  booking_type_id?: number | null;
}

export interface Booking extends SupabaseBooking {
  status: BookingStatus | null;
  activities: SupabaseActivity | null;
  platform_fee?: number;
  provider_amount?: number;
  activity_schedules?: ActivitySchedule[];
  schedule_instances?: ActivityScheduleInstance[];
  customer_name?: string | null;
  booking_date: string;
  total_price: number | null;
  participants?: number;
  provider_id?: string | null;
}

export interface ActivityForHomepage {
  id: number;
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
  duration?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  description?: string | null;
  max_participants?: number | null;
  technical_skill_level?: string | null;
  physical_effort_level?: string | null;
  includes_pickup?: boolean | null;
  includes_meal?: boolean | null;
}

export type Earning = {
  month: string;
  amount: number;
  includes_pickup?: boolean | null;
  includes_meal?: boolean | null;
};

export type EarningsData = {
  total: number;
  monthly: Earning[];
  pending: number;
};

export type RecentBooking = {
  id: string;
  customer_name: string | null;
  total_price: number | null;
  booking_date: string;
  status: BookingStatus | null;
  activity_title: string | null;
};

export type CommissionStats = {
  totalInvoices: number;
  totalCommissionAmount: number;
  paidInvoices: number;
  totalPaidAmount: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalPendingAmount: number;
};

export interface ScheduledActivity extends Activity {
  date: Date;
  time: string;
  day?: string;
  hour?: number;
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
