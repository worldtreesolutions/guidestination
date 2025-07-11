import { supabase } from "@/integrations/supabase/client"

export interface CustomerProfile {
  customer_id: string
  email: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  phone: string | null
  date_of_birth: string | null
  created_at: string
  updated_at: string
  user_id: string | null
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

export interface WishlistItem {
  id: string
  customer_id: string
  activity_id: number
  created_at: string
  activities?: {
    title: string
    image_urls?: string[]
    image_url?: string
    b_price?: number
    location?: string
    pickup_location?: string
  }
}

const customerService = {
  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return null;
    }
    const { data, error } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("customer_id", customerId)
      .single();

    if (error) {
      console.error("Error fetching customer profile:", error);
      return null;
    }
    return {
      ...data,
      full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      date_of_birth: null,
      user_id: data.customer_id
    } as CustomerProfile;
  },

  async updateCustomerProfile(customerId: string, profileData: Partial<CustomerProfile>): Promise<CustomerProfile | null> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const { data, error } = await supabase
      .from("customer_profiles")
      .update(profileData)
      .eq("customer_id", customerId)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer profile:", error);
      throw error;
    }
    return {
      ...data,
      full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      date_of_birth: null,
      user_id: data.customer_id
    } as CustomerProfile;
  },

  async getBookings(userId: string): Promise<Booking[]> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const result = await supabase
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
      .eq("user_id", userId)
      .order("booking_date", { ascending: false })

    if (result.error) {
      console.error("Error fetching bookings:", result.error)
      throw result.error
    }

    // Transform the data to match our Booking interface
    const transformedBookings = (result.data || []).map((booking: any) => ({
      ...booking,
      customer_id: booking.user_id || booking.customer_id
    }))

    return transformedBookings as Booking[]
  },

  async getBookingById(bookingId: string): Promise<Booking> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const result = await supabase
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
      .eq("id", bookingId)
      .single()

    if (result.error) {
      console.error("Error fetching booking by id:", result.error)
      throw result.error
    }

    // Transform the data to match our Booking interface
    const transformedBooking = {
      ...result.data,
      customer_id: result.data.user_id
    }

    return transformedBooking as Booking
  },

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const result = await supabase
      .from("wishlist")
      .select(
        `
        *,
        activities (
          title,
          b_price,
          image_url,
          pickup_location
        )
      `
      )
      .eq("user_id", userId)

    if (result.error) {
      console.error("Error fetching wishlist:", result.error)
      throw result.error
    }

    // Transform the data to match our WishlistItem interface
    const transformedWishlist = (result.data || []).map((item: any) => ({
      ...item,
      customer_id: item.user_id || item.customer_id
    }))

    return transformedWishlist as WishlistItem[]
  },

  async addToWishlist(userId: string, activityId: number) {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { data, error } = await supabase
      .from("wishlist")
      .insert([{ user_id: userId, activity_id: activityId }])
    if (error) throw error
    return data
  },

  async removeFromWishlist(userId: string, activityId: number) {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("activity_id", activityId)

    if (error) {
      console.error("Error removing from wishlist:", error)
      throw error
    }
    return true
  },
}

export default customerService
