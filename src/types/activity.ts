import { Database } from "@/integrations/supabase/types"

// Manually define types to bypass issues with generated types.
// These should eventually be replaced by correct auto-generated types.

export type SupabaseActivity = {
  id: number
  title: string
  description: string | null
  price: number
  b_price: number | null
  location: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  owner_id: string
  category_id: number | null
  image_url: string | null
  image_urls: string[] | null
  created_at: string
  updated_at: string
  status: "published" | "unpublished" | "draft" | "archived"
  average_rating?: number
  reviews_count?: number
  [key: string]: any // Allow other properties
}

export type SupabaseBooking = {
  id: string
  activity_id: number
  customer_id: string | null
  customer_name: string | null
  booking_date: string
  status: "confirmed" | "pending" | "cancelled"
  total_price: number
  created_at: string
  updated_at: string
  participants: number
  [key: string]: any
}

export type SupabaseActivitySchedule = {
  id: string
  activity_id: number
  start_time: string
  end_time: string
  day_of_week: number
  [key: string]: any
}

export type ActivityScheduleInstance = {
  id: string
  activity_schedule_id: string
  instance_date: string
  status: "available" | "booked" | "cancelled"
  [key: string]: any
}

export type ActivitySelectedOption = {
  id: string
  booking_id: string
  option_id: string
  quantity: number
  [key: string]: any
}

// This type was missing and causing errors
export type ScheduledActivity = SupabaseActivity & {
  schedules: SupabaseActivitySchedule[]
}

// Enriched Activity type for application use
export type Activity = SupabaseActivity & {
  category_name?: string
  media?: { url: string; type: "image" | "video" }[]
  schedules?: SupabaseActivitySchedule[]
  name?: string // Fallback for title
}

// Enriched Booking type with the related activity
export type Booking = SupabaseBooking & {
  activities: Activity | null
}

// A slimmed-down type for activity cards on the homepage
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
  image_url: string | null
  category_name?: string
}

// Type for earnings data visualization
export type Earning = {
  month: string
  amount: number
}

export type EarningsData = {
  total: number
  monthly: Earning[]
  pending: number
}

// A specific type for the recent bookings list in the dashboard
export type RecentBooking = Pick<
  Booking,
  "id" | "customer_name" | "total_price" | "booking_date" | "status"
> & {
  activity_title: string | null
}

// Utility type for booking status
export type BookingStatus = "confirmed" | "pending" | "cancelled"

export type CommissionInvoice = Tables<"commission_invoices">;
export type CommissionPayment = Tables<"commission_payments">;
export type Earning = { month: string; amount: number };
export type Provider = Tables<"activity_owners">;
export type CommissionStats = {
  totalInvoices: number;
  totalCommissionAmount: number;
  paidInvoices: number;
  totalPaidAmount: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalPendingAmount: number;
};

export type ActivityOwner = Tables<"activity_owners">;

export type ScheduledActivity = Activity & {
  date: Date;
  time: string;
};
