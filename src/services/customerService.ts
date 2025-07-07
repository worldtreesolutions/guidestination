import { supabase } from "@/integrations/supabase/client"

export interface CustomerProfile {
  id: string;
  user_id: string;
  name?: string | null;
  phone?: string | null;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

export interface Booking {
  id: string
  customer_id: string
  activity_id: number
  customer_name: string
  customer_email: string
  booking_date: string
  participants: number
  total_amount: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

export interface WishlistItem {
  id: string;
  user_id: string;
  activity_id: number;
  created_at: string;
}

export const customerService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data as unknown as CustomerProfile;
  },

  async updateProfile(userId: string, updates: Partial<CustomerProfile>) {
    const { data, error } = await supabase
      .from("customer_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as CustomerProfile;
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
    return data as unknown as CustomerProfile;
  },

  async getBookings(customerId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        activities (
          title,
          image_url,
          b_price
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Map the data to ensure customer_id is included
    const mappedData = data.map(booking => ({
      ...booking,
      customer_id: booking.customer_id || customerId
    }))
    
    return mappedData as Booking[]
  },

  async createBooking(
    booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([booking])
      .select()
      .single()

    if (error) throw error
    return data as Booking
  },

  async getWishlist(userId: string) {
    const { data, error } = await supabase
      .from("wishlist")
      .select(
        `
        *,
        activities (
          title,
          image_url,
          b_price
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      // The relation might not exist or image_url might be missing.
      // Fallback to query without the join.
      const {  wishlistData, error: wishlistError } = await supabase
        .from("wishlist")
        .select(`*`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (wishlistError) throw wishlistError;
      return wishlistData as WishlistItem[];
    }
    return data as WishlistItem[];
  },

  async addToWishlist(userId: string, activityId: number) {
    const { data, error } = await supabase
      .from("wishlist")
      .insert([
        {
          user_id: userId,
          activity_id: activityId,
        },
      ])
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
