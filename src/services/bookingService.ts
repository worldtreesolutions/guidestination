
import { supabase } from "@/integrations/supabase/client"

const BOOKINGS_TABLE = "bookings"
const ACTIVITIES_TABLE = "activities"

interface BookingStats {
  totalRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
}

export interface Booking {
  id: string
  customer_id?: string
  customer_name: string
  customer_email: string
  activity_id: number
  booking_date: string
  participants: number
  total_amount: number
  status: string
  created_at: string
  establishment_id?: string
  is_qr_booking?: boolean
  user_id?: string
  provider_id?: string
  total_price?: number
  provider_amount?: number
  platform_fee?: number
  activities?: {
    title: string
    description?: string
    image_urls?: string[]
    location?: string
    image_url?: string
    pickup_location?: string
  }
}

export const bookingService = {
  async getBookingStats(ownerId: string): Promise<BookingStats> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { data: activitiesData, error: activitiesError } = await supabase
      .from(ACTIVITIES_TABLE)
      .select("id")
      .eq("created_by", ownerId)

    if (activitiesError) {
      throw new Error(activitiesError.message)
    }

    const activityIds = activitiesData?.map((a) => a.id) || []

    if (activityIds.length === 0) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
      }
    }

    const { data: bookingsData, error: bookingsError } = await supabase
      .from(BOOKINGS_TABLE)
      .select("total_amount, status")
      .in("activity_id", activityIds)

    if (bookingsError) {
      console.error("Error fetching booking stats:", bookingsError)
      throw new Error(bookingsError.message)
    }

    const stats = (bookingsData || []).reduce(
      (acc: BookingStats, booking: { total_amount?: number; status: string }) => {
        if (booking.status === "confirmed") {
          acc.totalRevenue += booking.total_amount || 0
          acc.confirmedBookings += 1
        } else if (booking.status === "pending") {
          acc.pendingBookings += 1
        }
        acc.totalBookings += 1
        return acc
      },
      {
        totalRevenue: 0,
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
      }
    )

    return stats
  },

  async fetchRecentBookingsForOwner(
    ownerId: string,
    limit: number
  ): Promise<Booking[]> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { data: activitiesData, error: activitiesError } = await supabase
      .from(ACTIVITIES_TABLE)
      .select("id")
      .eq("created_by", ownerId)

    if (activitiesError) {
      throw new Error(activitiesError.message)
    }

    const activityIds = activitiesData?.map((a) => a.id) || []

    if (activityIds.length === 0) {
      return []
    }

    const { data: bookingsData, error: bookingsError } = await supabase
      .from(BOOKINGS_TABLE)
      .select(`
        id,
        customer_id,
        customer_name,
        customer_email,
        activity_id,
        booking_date,
        participants,
        total_amount,
        status,
        created_at,
        establishment_id,
        is_qr_booking
      `)
      .in("activity_id", activityIds)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (bookingsError) {
      console.error("Error fetching recent bookings:", bookingsError)
      throw new Error(bookingsError.message)
    }

    return (bookingsData || []).map((item: any) => ({
      id: item.id,
      customer_id: item.customer_id,
      customer_name: item.customer_name,
      customer_email: item.customer_email,
      activity_id: item.activity_id,
      booking_date: item.booking_date,
      participants: item.participants,
      total_amount: item.total_amount,
      status: item.status,
      created_at: item.created_at,
      establishment_id: item.establishment_id,
      is_qr_booking: item.is_qr_booking,
      user_id: item.user_id || item.customer_id,
      provider_id: item.provider_id || "",
      total_price: item.total_amount,
      provider_amount: item.provider_amount || 0,
      platform_fee: item.platform_fee || 0
    })) as Booking[]
  },

  async fetchBookingsForOwner(ownerId: string): Promise<Booking[]> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { data: activitiesData, error: activitiesError } = await supabase
      .from(ACTIVITIES_TABLE)
      .select("id")
      .eq("created_by", ownerId)

    if (activitiesError) {
      throw new Error(activitiesError.message)
    }

    const activityIds = activitiesData?.map((a) => a.id) || []

    if (activityIds.length === 0) {
      return []
    }

    const { data: bookingsData, error: bookingsError } = await supabase
      .from(BOOKINGS_TABLE)
      .select(`
        id,
        customer_id,
        customer_name,
        customer_email,
        activity_id,
        booking_date,
        participants,
        total_amount,
        status,
        created_at,
        establishment_id,
        is_qr_booking
      `)
      .in("activity_id", activityIds)
      .order("created_at", { ascending: false })

    if (bookingsError) {
      console.error("Error fetching bookings for owner:", bookingsError)
      throw new Error(bookingsError.message)
    }

    return (bookingsData || []).map((item: any) => ({
      id: item.id,
      customer_id: item.customer_id,
      customer_name: item.customer_name,
      customer_email: item.customer_email,
      activity_id: item.activity_id,
      booking_date: item.booking_date,
      participants: item.participants,
      total_amount: item.total_amount,
      status: item.status,
      created_at: item.created_at,
      establishment_id: item.establishment_id,
      is_qr_booking: item.is_qr_booking,
      user_id: item.user_id || item.customer_id,
      provider_id: item.provider_id || "",
      total_price: item.total_amount,
      provider_amount: item.provider_amount || 0,
      platform_fee: item.platform_fee || 0
    })) as Booking[]
  },
}
