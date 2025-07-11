
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
  customer_id: string | null
  activity_id: number
  booking_date: string
  participants: number
  total_amount: number
  status: string
  created_at: string
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

    const activitiesResult = await supabase
      .from(ACTIVITIES_TABLE)
      .select("id")
      .eq("owner_id", ownerId)

    if (activitiesResult.error) {
      throw new Error(activitiesResult.error.message)
    }

    const activityIds = activitiesResult.data?.map((a: any) => a.id) || []

    if (activityIds.length === 0) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
      }
    }

    const bookingsResult = await supabase
      .from(BOOKINGS_TABLE)
      .select("total_amount, status")
      .in("activity_id", activityIds)

    if (bookingsResult.error) {
      console.error("Error fetching booking stats:", bookingsResult.error)
      throw new Error(bookingsResult.error.message)
    }

    const stats = (bookingsResult.data || []).reduce(
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

    const activitiesResult = await supabase
      .from(ACTIVITIES_TABLE)
      .select("id")
      .eq("owner_id", ownerId)

    if (activitiesResult.error) {
      throw new Error(activitiesResult.error.message)
    }

    const activityIds = activitiesResult.data?.map((a: any) => a.id) || []

    if (activityIds.length === 0) {
      return []
    }

    const bookingsResult = await supabase
      .from(BOOKINGS_TABLE)
      .select(`
        id,
        customer_id,
        activity_id,
        booking_date,
        participants,
        total_amount,
        status,
        created_at,
        activities:activity_id(title, description, image_url, pickup_location)
      `)
      .in("activity_id", activityIds)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (bookingsResult.error) {
      console.error("Error fetching recent bookings:", bookingsResult.error)
      throw new Error(bookingsResult.error.message)
    }

    return (bookingsResult.data || []).map((item: any) => ({
      id: item.id,
      customer_id: item.customer_id,
      activity_id: item.activity_id,
      booking_date: item.booking_date,
      participants: item.participants,
      total_amount: item.total_amount,
      status: item.status,
      created_at: item.created_at,
      activities: item.activities
    })) as Booking[]
  },

  async fetchBookingsForOwner(ownerId: string): Promise<Booking[]> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const activitiesResult = await supabase
      .from(ACTIVITIES_TABLE)
      .select("id")
      .eq("owner_id", ownerId)

    if (activitiesResult.error) {
      throw new Error(activitiesResult.error.message)
    }

    const activityIds = activitiesResult.data?.map((a: any) => a.id) || []

    if (activityIds.length === 0) {
      return []
    }

    const bookingsResult = await supabase
      .from(BOOKINGS_TABLE)
      .select(`
        id,
        customer_id,
        activity_id,
        booking_date,
        participants,
        total_amount,
        status,
        created_at,
        activities:activity_id(title, description, image_url, pickup_location)
      `)
      .in("activity_id", activityIds)
      .order("created_at", { ascending: false })

    if (bookingsResult.error) {
      console.error("Error fetching bookings for owner:", bookingsResult.error)
      throw new Error(bookingsResult.error.message)
    }

    return (bookingsResult.data || []).map((item: any) => ({
      id: item.id,
      customer_id: item.customer_id,
      activity_id: item.activity_id,
      booking_date: item.booking_date,
      participants: item.participants,
      total_amount: item.total_amount,
      status: item.status,
      created_at: item.created_at,
      activities: item.activities
    })) as Booking[]
  },
}
