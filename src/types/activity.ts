
import { Database } from "@/integrations/supabase/types"

export type SupabaseActivity = Database["public"]["Tables"]["activities"]["Row"]
export type ActivityScheduleInstance =
  Database["public"]["Tables"]["activity_schedule_instances"]["Row"]
export type ActivitySelectedOption =
  Database["public"]["Tables"]["activity_selected_options"]["Row"] & {
    activity_options:
      | Database["public"]["Tables"]["activity_options"]["Row"]
      | null
  }

export type ActivityMedia = {
  id: number
  activity_id: number
  url: string
  type: "image" | "video"
  thumbnail_url?: string | null
}

// Enhanced Activity type with all possible properties made optional to prevent crashes
export type Activity = SupabaseActivity & {
  schedule_instances?: ActivityScheduleInstance[]
  selected_options?: ActivitySelectedOption[]
  category_name?: string
  image_urls?: string[]
  schedules?: any
  rating?: number
  location?: string
  booking_type?: string
  media?: ActivityMedia[]
  average_rating?: number
  address?: string
  name?: string // Add name as it's used as a fallback for title
  price?: number // Add price property
  b_price?: number // Add b_price property
  provider_id?: string // Ensure provider_id is available
}

export type ScheduledActivity = Activity & {
  date: string
  time: string
  day?: string
  hour?: number | string
}

// Comprehensive SupabaseBooking type definition
export type SupabaseBooking = {
  id: number
  created_at: string
  updated_at?: string
  user_id: string
  activity_id: number
  booking_date: string
  start_time: string
  end_time: string
  participants: number
  total_price: number
  status: "confirmed" | "pending" | "cancelled"
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  payment_intent_id: string | null
  commission_invoice_generated?: boolean
  is_qr_booking?: boolean
  establishment_id?: string | null
  qr_establishment_id?: string | null
  special_requests?: string | null
  booking_reference?: string | null
}

// Enhanced Booking type with proper activity relationship
export type Booking = SupabaseBooking & {
  activities: SupabaseActivity | Activity
}

// Flexible Earning type for different use cases
export type Earning = {
  month: string
  total_earnings?: number
  amount?: number // Make amount optional for compatibility
}

// Comprehensive ActivityForHomepage type
export type ActivityForHomepage = {
  id: number
  title: string
  image_url: string | null
  price?: number | null
  location?: string | null
  category_name?: string | null
  rating?: number | null
  address: string | null
  average_rating: number | null
  b_price: number | null
  provider_id?: string | null
  description?: string | null
  duration?: number | null
}

export type RecommendedActivity = SupabaseActivity & {
  similarity: number
  price?: number
  category_name?: string
  average_rating?: number
}

export type ScheduleDate = {
  date: string
  startTime: string
  endTime: string
  booked: number
  available: number
}

// Additional types for better type safety
export type BookingStatus = "confirmed" | "pending" | "cancelled"

export type ActivityProvider = {
  id: string
  name: string
  email: string
  phone?: string
  company_name?: string
  created_at: string
}

export type EarningsData = {
  total: number
  monthly: Array<{
    month: string
    amount: number
  }>
  pending: number
}

// Dashboard specific types
export type DashboardStats = {
  totalBookings: number
  totalEarnings: number
  pendingBookings: number
  confirmedBookings: number
}

export type ActivityStats = {
  totalActivities: number
  activeActivities: number
  draftActivities: number
  averageRating: number
}
