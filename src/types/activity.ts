
import { Database } from "@/integrations/supabase/types"

// Base types from Supabase, using the 'Row' type for fetched data
export type SupabaseActivity = Database["public"]["Tables"]["activities"]["Row"]
export type SupabaseBooking = Database["public"]["Tables"]["bookings"]["Row"]
export type SupabaseActivitySchedule =
  Database["public"]["Tables"]["activity_schedules"]["Row"]

// Enriched Activity type for application use
export type Activity = SupabaseActivity & {
  // Optional enriched properties that may be joined or computed
  category_name?: string
  average_rating?: number
  media?: { url: string; type: "image" | "video" }[]
  schedules?: SupabaseActivitySchedule[]
  // Compatibility properties for different parts of the app
  name?: string // Fallback for title
  price?: number
  b_price?: number
  image_urls?: string[]
  location?: string
}

// Enriched Booking type with the related activity
export type Booking = SupabaseBooking & {
  // The related activity for a booking, which can be null if not joined
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
