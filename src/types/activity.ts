
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
export type Activity = SupabaseActivity & {
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
};

export type Booking = Omit<SupabaseBooking, "status"> & {
  status: BookingStatus | null;
  activities: Activity | null;
  activity_title?: string | null;
  platform_fee?: number;
  provider_amount?: number;
};

// Slimmed-down type for homepage activity cards
export type ActivityForHomepage = Pick<
  Activity,
  | "id"
  | "title"
  | "price"
  | "b_price"
  | "location"
  | "address"
  | "average_rating"
> & {
  image_url: string | null;
  category_name?: string;
};

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
export type RecentBooking = Pick<
  Booking,
  "id" | "customer_name" | "total_price" | "booking_date" | "status"
> & {
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
export type ScheduledActivity = Activity & {
  date: Date;
  time: string;
};
  