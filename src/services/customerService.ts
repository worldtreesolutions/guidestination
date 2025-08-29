import { supabase } from "@/integrations/supabase/client"

export interface Customer {
  cus_id: string
  email: string
  full_name: string
  phone: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
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
  async createCustomer(userData: {
    cus_id: string;
    email: string;
    full_name: string;
    phone?: string;
    is_active?: boolean;
  }): Promise<any> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return null;
    }

    try {
      // Use supabaseAny to bypass TypeScript type checking for customers table
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("customers")
        .insert({
          cus_id: userData.cus_id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone || null,
          is_active: userData.is_active !== false // default to true
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating customer:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in createCustomer:", error);
      throw error;
    }
  },

  async getCustomer(customerId: string): Promise<Customer | null> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return null;
    }
    
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("customers")
        .select("*")
        .eq("cus_id", customerId)
        .single();

      if (error) {
        console.error("Error fetching customer:", error);
        return null;
      }
      return data as Customer;
    } catch (error) {
      console.error("Error in getCustomer:", error);
      return null;
    }
  },

  async updateCustomer(customerId: string, customerData: Partial<Customer>): Promise<Customer | null> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("customers")
        .update(customerData)
        .eq("cus_id", customerId)
        .select()
        .single();

      if (error) {
        console.error("Error updating customer:", error);
        throw error;
      }
      return data as Customer;
    } catch (error) {
      console.error("Error in updateCustomer:", error);
      throw error;
    }
  },

  async getBookings(userId: string): Promise<Booking[]> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const result = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_id", userId)
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
      customer_id: result.data.customer_id
    }

    return transformedBooking as Booking
  },

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const result = await supabase
      .from("wishlist")
      .select("*")
      .eq("customer_id", userId)

    if (result.error) {
      console.error("Error fetching wishlist:", result.error)
      throw result.error
    }

    // Transform the data to match our WishlistItem interface
    const transformedWishlist = (result.data || []).map((item: any) => ({
      ...item,
      customer_id: item.customer_id || item.user_id
    }))

    return transformedWishlist as WishlistItem[]
  },

  async addToWishlist(userId: string, activityId: number) {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    // Check if item is already in wishlist to prevent duplicates
    const { data: existing } = await supabase
      .from("wishlist")
      .select("id")
      .eq("customer_id", userId)
      .eq("activity_id", activityId)
      .single()

    if (existing) {
      // Item already exists, return success
      return existing
    }

    const { data, error } = await supabase
      .from("wishlist")
      .insert([{ customer_id: userId, activity_id: activityId }])
    
    if (error) {
      console.error("Error adding to wishlist:", error)
      throw error
    }
    return data
  },

  async removeFromWishlist(userId: string, activityId: number) {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

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
  }

}

export default customerService
