
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
    // This requires a join through activities table
    const {  activities, error: activitiesError } = await supabase
      .from("activities")
      .select("id")
      .eq("provider_id", ownerId)

    if (activitiesError) {
      console.error("Error fetching owner activities:", activitiesError)
      return []
    }

    const activityIds = activities.map((a) => a.id)

    if (activityIds.length === 0) {
      return []
    }

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
  },

  async fetchRecentBookingsForOwner(
    ownerId: string,
    limit = 5
  ): Promise<Booking[]> {
    const {  activities, error: activitiesError } = await supabase
      .from("activities")
      .select("id")
      .eq("provider_id", ownerId)

    if (activitiesError) {
      console.error("Error fetching owner activities:", activitiesError)
      return []
    }

    const activityIds = activities.map((a) => a.id)

    if (activityIds.length === 0) {
      return []
    }

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
}
  