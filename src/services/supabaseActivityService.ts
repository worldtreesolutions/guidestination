import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"

type ActivityRow = Database["public"]["Tables"]["activities"]["Row"]

export interface SupabaseActivity extends ActivityRow {
  // Add computed properties for compatibility
  images: string[]
  videos?: { url: string; thumbnail?: string; duration?: number }[]
  schedule?: {
    availableDates: string[]
    startTime?: string
    endTime?: string
  }
  // Add missing properties that might not be in the database schema yet
  category?: string
  location?: string
  average_rating?: number
  review_count?: number
  includes_pickup?: boolean
  pickup_locations?: string
  includes_meal?: boolean
  meal_description?: string
  name?: string
}

export interface ActivityBooking {
  id: string
  activity_id: number
  customer_id: string
  booking_date: string
  participants: number
  total_amount: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  created_at: string
}

export const supabaseActivityService = {
  // Get activity by ID with media and schedule
  async getActivityById(activityId: string): Promise<SupabaseActivity | null> {
    try {
      const { data: activity, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_media (
            id,
            media_url,
            media_type,
            thumbnail_url,
            duration,
            file_size
          ),
          activity_schedules (
            id,
            start_time,
            end_time,
            availability_start_date,
            availability_end_date,
            capacity,
            is_active
          )
        `)
        .eq("id", activityId)
        .eq("is_active", true)
        .single()

      if (error) {
        console.error("Error fetching activity:", error)
        return null
      }

      if (!activity) return null

      // Transform the data to match our interface
      const transformedActivity: SupabaseActivity = {
        ...activity,
        images: activity.activity_media
          ?.filter((media: any) => media.media_type === "image")
          .map((media: any) => media.media_url) || [],
        videos: activity.activity_media
          ?.filter((media: any) => media.media_type === "video")
          .map((media: any) => ({
            url: media.media_url,
            thumbnail: media.thumbnail_url,
            duration: media.duration
          })) || [],
        schedule: {
          availableDates: activity.activity_schedules
            ?.filter((schedule: any) => schedule.is_active)
            .map((schedule: any) => schedule.availability_start_date)
            .filter(Boolean) || [],
          startTime: activity.activity_schedules?.[0]?.start_time,
          endTime: activity.activity_schedules?.[0]?.end_time
        }
      }

      return transformedActivity
    } catch (error) {
      console.error("Error in getActivityById:", error)
      return null
    }
  },

  // Get all published activities with pagination
  async getPublishedActivities(
    page: number = 1,
    limit: number = 12,
    filters?: {
      category?: string
      minPrice?: number
      maxPrice?: number
      location?: string
    }
  ): Promise<{ activities: SupabaseActivity[]; total: number }> {
    try {
      let query = supabase
        .from("activities")
        .select(`
          *,
          activity_media (
            id,
            media_url,
            media_type,
            thumbnail_url
          )
        `, { count: "exact" })
        .eq("is_active", true)

      // Apply filters
      if (filters?.category) {
        query = query.eq("category", filters.category)
      }
      if (filters?.minPrice) {
        query = query.gte("final_price", filters.minPrice)
      }
      if (filters?.maxPrice) {
        query = query.lte("final_price", filters.maxPrice)
      }
      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`)
      }

      // Add pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data: activities, error, count } = await query

      if (error) {
        console.error("Error fetching activities:", error)
        return { activities: [], total: 0 }
      }

      const transformedActivities: SupabaseActivity[] = activities?.map(activity => ({
        ...activity,
        images: activity.activity_media
          ?.filter((media: any) => media.media_type === "image")
          .map((media: any) => media.media_url) || [],
        videos: activity.activity_media
          ?.filter((media: any) => media.media_type === "video")
          .map((media: any) => ({
            url: media.media_url,
            thumbnail: media.thumbnail_url
          })) || []
      })) || []

      return {
        activities: transformedActivities,
        total: count || 0
      }
    } catch (error) {
      console.error("Error in getPublishedActivities:", error)
      return { activities: [], total: 0 }
    }
  },

  // Create a booking
  async createBooking(bookingData: {
    activityId: number
    customerId: string
    bookingDate: string
    participants: number
    totalAmount: number
  }): Promise<ActivityBooking | null> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          activity_id: bookingData.activityId,
          customer_id: bookingData.customerId,
          booking_date: bookingData.bookingDate,
          participants: bookingData.participants,
          total_amount: bookingData.totalAmount,
          status: "pending"
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating booking:", error)
        return null
      }

      return data as ActivityBooking
    } catch (error) {
      console.error("Error in createBooking:", error)
      return null
    }
  },

  // Get activity reviews
  async getActivityReviews(activityId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          customers (
            full_name,
            email
          )
        `)
        .eq("activity_id", activityId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching reviews:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getActivityReviews:", error)
      return []
    }
  },

  // Upload activity media to Supabase Storage
  async uploadActivityMedia(
    file: File,
    activityId: string,
    mediaType: "image" | "video"
  ): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${activityId}/${mediaType}s/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from("activity-media")
        .upload(fileName, file)

      if (error) {
        console.error("Error uploading file:", error)
        return null
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("activity-media")
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error("Error in uploadActivityMedia:", error)
      return null
    }
  }
}
