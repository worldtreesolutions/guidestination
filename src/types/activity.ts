
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
}

export type ScheduledActivity = Activity & {
  date: string
  time: string
  day?: string
  hour?: number | string
}

// Manually define SupabaseBooking as it's missing from generated types
export type SupabaseBooking = {
  id: number
  created_at: string
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
}

export type Booking = SupabaseBooking & {
  activities: SupabaseActivity
}

export type Earning = {
  month: string
  total_earnings: number
  amount?: number // Make amount optional
}

export type ActivityForHomepage = {
  id: number
  title: string
  image_url: string | null
  price?: number | null // Make optional
  location?: string | null // Make optional
  category_name?: string | null // Make optional
  rating?: number | null // Make optional
  address: string | null
  average_rating: number | null
  b_price: number | null
}

export type RecommendedActivity = SupabaseActivity & {
  similarity: number
  price?: number // Add optional price
}

export type ScheduleDate = {
  date: string
  startTime: string
  endTime: string
  booked: number
  available: number
}
  