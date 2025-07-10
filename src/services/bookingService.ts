
import { supabase } from "@/integrations/supabase/client"
import { getAdminClient } from "@/integrations/supabase/admin"
import type { Database } from "@/integrations/supabase/types"

type Booking = Database["public"]["Tables"]["bookings"]["Row"]
type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"]

export const bookingService = {
  async createBooking(bookingData: BookingInsert) {
    const client = getAdminClient()
    if (!client) throw new Error("Database connection not available")

    const { data, error } = await client
      .from("bookings")
      .insert(bookingData)
      .select()
      .single()

    if (error) {
      console.error("Error creating booking:", error)
      throw error
    }

    return data
  },

  async getBookingById(bookingId: number) {
    const client = getAdminClient()
    if (!client) throw new Error("Database connection not available")

    const { data, error } = await client
      .from("bookings")
      .select(`
        *,
        activities (
          *,
          activity_owners (
            id,
            email,
            business_name,
            provider_id
          )
        ),
        establishments (
          *,
          partner_registrations (
            id,
            email,
            owner_name,
            business_name,
            commission_package
          )
        )
      `)
      .eq("id", bookingId)
      .single()

    if (error) {
      console.error("Error fetching booking:", error)
      throw error
    }

    return data
  },

  async updateBookingStatus(bookingId: number, status: string) {
    const client = getAdminClient()
    if (!client) throw new Error("Database connection not available")

    const { data, error } = await client
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .select()
      .single()

    if (error) {
      console.error("Error updating booking status:", error)
      throw error
    }

    return data
  },

  async markCommissionInvoiceGenerated(bookingId: number) {
    const client = getAdminClient()
    if (!client) throw new Error("Database connection not available")

    const { error } = await client
      .from("bookings")
      .update({ commission_invoice_generated: true })
      .eq("id", bookingId)

    if (error) {
      console.error("Error marking commission invoice as generated:", error)
      throw error
    }
  },

  async getBookingsByCustomerEmail(customerEmail: string) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        activities (
          title,
          description,
          images
        )
      `)
      .eq("customer_email", customerEmail)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching customer bookings:", error)
      throw error
    }

    return data
  },

  async getBookingsByActivityOwner(ownerId: string) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        activities!inner (
          title,
          description,
          activity_owners!inner (
            id
          )
        )
      `)
      .eq("activities.activity_owners.id", ownerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching activity owner bookings:", error)
      throw error
    }

    return data
  }
}

export default bookingService
