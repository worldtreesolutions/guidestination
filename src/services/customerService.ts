import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"

export type CustomerProfile = Database["public"]["Tables"]["customer_profiles"]["Row"]

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
  }
}

export interface WishlistItem {
  id: number
  user_id: string
  activity_id: number
  created_at: string
  activities?: {
    title: string
    image_urls?: string[]
    image_url?: string
    b_price?: number
    location?: string
  }
}

const customerService = {
  async getProfile(userId: string): Promise<CustomerProfile | null> {
    const { data, error } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("customer_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error)
      throw error
    }

    return data
  },

  async updateProfile(userId: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const { data, error } = await supabase
      .from("customer_profiles")
      .update(updates)
      .eq("customer_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      throw error
    }

    return data
  },

  async getBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        activities (
          title,
          description,
          image_url,
          location
        )
      `
      )
      .eq("customer_id", userId)
      .order("booking_date", { ascending: false })

    if (error) {
      console.error("Error fetching bookings:", error)
      throw error
    }
    return data as unknown as Booking[]
  },

  async getBookingById(bookingId: string): Promise<Booking> {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        activities (
          title,
          description,
          image_url,
          pickup_location
        )
      `
      )
      .eq("id", parseInt(bookingId))
      .single()

    if (error) {
      console.error("Error fetching booking by id:", error)
      throw error
    }
    return data as unknown as Booking
  },

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabase
      .from("wishlist")
      .select(
        `
        *,
        activities (
          title,
          b_price:b_price,
          image_url,
          pickup_location
        )
      `
      )
      .eq("customer_id", userId)

    if (error) {
      console.error("Error fetching wishlist:", error)
      throw error
    }
    return data as unknown as WishlistItem[]
  },

  async addToWishlist(userId: string, activityId: number) {
    const { data, error } = await supabase
      .from("wishlist")
      .insert([{ customer_id: userId, activity_id: activityId }])
      .select()
      .single()

    if (error) {
      console.error("Error adding to wishlist:", error)
      throw error
    }
    return data
  },

  async removeFromWishlist(userId: string, activityId: number) {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("customer_id", userId)
      .eq("activity_id", activityId)

    if (error) {
      console.error("Error removing from wishlist:", error)
      throw error
    }
    return true
  },
}

export default customerService
