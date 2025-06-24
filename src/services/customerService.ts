
import { supabase } from "@/integrations/supabase/client"

export interface CustomerProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  phone?: string
  date_of_birth?: string
  created_at: string
  updated_at: string
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
}

export interface WishlistItem {
  id: string
  customer_id: string
  activity_id: number
  created_at: string
}

export const customerService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data as CustomerProfile
  },

  async updateProfile(userId: string, updates: Partial<CustomerProfile>) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data as CustomerProfile
  },

  async createProfile(profile: Omit<CustomerProfile, 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .insert([profile])
      .select()
      .single()

    if (error) throw error
    return data as CustomerProfile
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
    return data as Booking[]
  },

  async createBooking(booking: Omit<Booking, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([booking])
      .select()
      .single()

    if (error) throw error
    return data as Booking
  },

  async getWishlist(customerId: string) {
    const { data, error } = await supabase
      .from('wishlist')
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
    return data as WishlistItem[]
  },

  async addToWishlist(customerId: string, activityId: number) {
    const { data, error } = await supabase
      .from('wishlist')
      .insert([{
        customer_id: customerId,
        activity_id: activityId
      }])
      .select()
      .single()

    if (error) throw error
    return data as WishlistItem
  },

  async removeFromWishlist(customerId: string, activityId: number) {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('customer_id', customerId)
      .eq('activity_id', activityId)

    if (error) throw error
    return true
  }
}

export default customerService
