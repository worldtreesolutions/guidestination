import { supabase } from "@/integrations/supabase/client"
import { Booking } from "@/types/activity"

const BOOKINGS_TABLE = "bookings"
const ACTIVITIES_TABLE = "activities"

export const bookingService = {
  async getBookingStats(ownerId: string) {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { data: activities, error: activitiesError } = await supabase
      .from(ACTIVITIES_TABLE)
      .select("id")
      .eq("owner_id", ownerId)

    if (activitiesError) {
      throw new Error(activitiesError.message)
    }

    const activityIds = activities?.map((a: any) => a.id) || []

    if (activityIds.length === 0) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
      }
    }

    const { data, error } = await supabase
      .from(BOOKINGS_TABLE)
      .select("total_price, status")
      .in("activity_id", activityIds)

    if (error) {
      console.error("Error fetching booking stats:", error)
      throw new Error(error.message)
    }

    const stats = (data || []).reduce(
      (acc: any, booking: any) => {
        if (booking.status === "confirmed") {
          acc.totalRevenue += booking.total_price || 0
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

    const { data: activities, error: activitiesError } = await supabase
      .from(ACTIVITIES_TABLE)
      .select("id")
      .eq("owner_id", ownerId)

    if (activitiesError) {
      throw new Error(activitiesError.message)
    }

    const activityIds = activities?.map((a: any) => a.id) || []

    if (activityIds.length === 0) {
      return []
    }

    const { data, error } = await supabase
      .from(BOOKINGS_TABLE)
      .select(`
        *,
        activities:activity_id(*)
      `)
      .in("activity_id", activityIds)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent bookings:", error)
      throw new Error(error.message)
    }

    return (data || []) as Booking[]
  },

  async fetchBookingsForOwner(ownerId: string): Promise<Booking[]> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { data: activities, error: activitiesError } = await supabase
      .from(ACTIVITIES_TABLE)
      .select("id")
      .eq("owner_id", ownerId)

    if (activitiesError) {
      throw new Error(activitiesError.message)
    }

    const activityIds = activities?.map((a: any) => a.id) || []

    if (activityIds.length === 0) {
      return []
    }

    const { data, error } = await supabase
      .from(BOOKINGS_TABLE)
      .select(`
        *,
        activities:activity_id(*)
      `)
      .in("activity_id", activityIds)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching bookings for owner:", error)
      throw new Error(error.message)
    }

    return (data || []) as Booking[]
  },
}
