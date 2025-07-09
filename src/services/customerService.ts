import { supabase } from "@/integrations/supabase/client"

export interface CustomerProfile {
  id: string;
  user_id: string;
  phone?: string | null;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface Booking {
  id: string
  customer_id: string
  activity_id: number
  booking_date: string
  participants: number
  total_amount: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  activities?: {
    title: string
    description?: string
    image_urls?: string[]
    location?: string
    image_url?: string 
  }
}

export interface WishlistItem {
  id: string;
  user_id: string;
  activity_id: number;
  created_at: string;
  activities?: {
    title: string
    image_url?: string
    b_price?: number
    location?: string
  }
}

export const customerService = {
  async getProfile(userId: string): Promise<CustomerProfile | null> {
    const { data, error } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching profile:", error);
      throw error;
    }
    return data;
  },

  async updateProfile(userId: string, updates: Partial<CustomerProfile>) {
    const { data, error } = await supabase
      .from("customer_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as CustomerProfile;
  },

  async createProfile(
    profile: Omit<CustomerProfile, "id" | "created_at" | "updated_at">
  ) {
    const { data, error } = await supabase
      .from("customer_profiles")
      .insert([profile])
      .select()
      .single();

    if (error) throw error;
    return data as CustomerProfile;
  },

  async getBookings(customerId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        activities (
          title,
          description,
          image_urls,
          location,
          image_url
        )
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching customer bookings:", error)
      throw error
    }

    return data.map(booking => ({
      ...booking,
      id: booking.id.toString(),
    })) as Booking[]
  },

  async getBookingById(bookingId: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        activities (
          title,
          description,
          image_urls,
          location,
          image_url
        )
      `)
      .eq("id", bookingId)
      .single()

    if (error) {
      console.error("Error fetching booking:", error)
      return null
    }

    return {
      ...data,
      id: data.id.toString(),
    } as Booking
  },

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabase
      .from("wishlist")
      .select(
        `
        *,
        activities (
          title,
          image_url,
          b_price,
          location
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishlist:", error);
      throw error;
    }
    return data as WishlistItem[];
  },

  async addToWishlist(userId: string, activityId: number) {
    const { data, error } = await supabase
      .from("wishlist")
      .insert([{ user_id: userId, activity_id: activityId }])
      .select()
      .single();

    if (error) throw error;
    return data as WishlistItem;
  },

  async removeFromWishlist(userId: string, activityId: number) {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("activity_id", activityId);

    if (error) throw error;
    return true;
  },
}

export default customerService
