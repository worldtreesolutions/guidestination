
import { supabase } from "@/integrations/supabase/client"
import { Booking, SupabaseBooking } from "@/types/activity"

export const bookingService = {
  async createBooking(bookingData: any) {
    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()

    if (error) {
      console.error("Error creating booking:", error)
      throw new Error("Failed to create booking.")
    }
    return data[0]
  },

  async fetchBookingsForUser(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        activities (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user bookings:", error)
      return []
    }
    return data as Booking[]
  },

  async fetchBookingsForOwner(ownerId: string): Promise<Booking[]> {
    try {
      // First get all activities for this owner
      const { data: activities, error: activitiesError } = await supabase
        .from("activities")
        .select("id")
        .eq("provider_id", ownerId)

      if (activitiesError) {
        console.error("Error fetching owner activities:", activitiesError)
        return []
      }

      if (!activities || activities.length === 0) {
        return []
      }

      const activityIds = activities.map((a) => a.id)

      // Then get all bookings for those activities
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          activities (*)
        `
        )
        .in("activity_id", activityIds)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching owner bookings:", error)
        return []
      }

      return data as Booking[]
    } catch (error) {
      console.error("Unexpected error in fetchBookingsForOwner:", error)
      return []
    }
  },

  async fetchRecentBookingsForOwner(
    ownerId: string,
    limit = 5
  ): Promise<Booking[]> {
    try {
      // First get all activities for this owner
      const { data: activities, error: activitiesError } = await supabase
        .from("activities")
        .select("id")
        .eq("provider_id", ownerId)

      if (activitiesError) {
        console.error("Error fetching owner activities:", activitiesError)
        return []
      }

      if (!activities || activities.length === 0) {
        return []
      }

      const activityIds = activities.map((a) => a.id)

      // Then get recent bookings for those activities
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          activities (*)
        `
        )
        .in("activity_id", activityIds)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching recent owner bookings:", error)
        return []
      }

      return data as Booking[]
    } catch (error) {
      console.error("Unexpected error in fetchRecentBookingsForOwner:", error)
      return []
    }
  },

  async updateBookingStatus(bookingId: number, status: string) {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .select()

    if (error) {
      console.error("Error updating booking status:", error)
      throw new Error("Failed to update booking status.")
    }
    return data[0]
  },

  async getBookingById(bookingId: number): Promise<Booking | null> {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        activities (*)
      `
      )
      .eq("id", bookingId)
      .single()

    if (error) {
      console.error("Error fetching booking by ID:", error)
      return null
    }

    return data as Booking
  },

  async getBookingStats(ownerId: string) {
    try {
      // Get activities for owner
      const { data: activities, error: activitiesError } = await supabase
        .from("activities")
        .select("id")
        .eq("provider_id", ownerId)

      if (activitiesError || !activities) {
        console.error("Error fetching activities for stats:", activitiesError)
        return {
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0
        }
      }

      const activityIds = activities.map((a) => a.id)

      if (activityIds.length === 0) {
        return {
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0
        }
      }

      // Get booking stats
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("status, total_price")
        .in("activity_id", activityIds)

      if (bookingsError || !bookings) {
        console.error("Error fetching bookings for stats:", bookingsError)
        return {
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0
        }
      }

      const stats = bookings.reduce(
        (acc, booking) => {
          acc.totalBookings++
          if (booking.status === "confirmed") {
            acc.confirmedBookings++
            acc.totalRevenue += booking.total_price || 0
          } else if (booking.status === "pending") {
            acc.pendingBookings++
          } else if (booking.status === "cancelled") {
            acc.cancelledBookings++
          }
          return acc
        },
        {
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0
        }
      )

      return stats
    } catch (error) {
      console.error("Unexpected error in getBookingStats:", error)
      return {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0
      }
    }
  }
}

export default bookingService
