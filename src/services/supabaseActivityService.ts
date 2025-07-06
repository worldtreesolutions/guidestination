
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"

type ActivityRow = Database["public"]["Tables"]["activities"]["Row"]
type ActivityMediaRow = Database["public"]["Tables"]["activity_media"]["Row"]
type ActivityScheduleRow = Database["public"]["Tables"]["activity_schedules"]["Row"]

// Define a more specific type for the joined data
type ActivityWithRelations = ActivityRow & {
  activity_media: ActivityMediaRow[]
  activity_schedules: ActivityScheduleRow[]
}

export interface SupabaseActivity extends ActivityRow {
  images: string[]
  videos: { url: string; thumbnail?: string | null; duration?: number | null }[]
  schedule: {
    availableDates: string[]
    startTime?: string
    endTime?: string
  }
}

export type ActivityBooking = Database["public"]["Tables"]["bookings"]["Row"]

export const supabaseActivityService = {
  async getActivityById(activityId: string): Promise<SupabaseActivity | null> {
    try {
      const id = parseInt(activityId, 10);
      if (isNaN(id)) {
        console.error("Invalid activity ID provided.");
        return null;
      }

      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_media (*),
          activity_schedules (*)
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single<ActivityWithRelations>()

      if (error) {
        console.error("Error fetching activity:", error)
        return null
      }

      if (!data) return null

      const transformedActivity: SupabaseActivity = {
        ...data,
        images: data.activity_media
          ?.filter(media => media.media_type === "image")
          .map(media => media.media_url) || [],
        videos: data.activity_media
          ?.filter(media => media.media_type === "video")
          .map(media => ({
            url: media.media_url,
            thumbnail: media.thumbnail_url,
            duration: media.duration
          })) || [],
        schedule: {
          availableDates: data.activity_schedules
            ?.filter(schedule => schedule.is_active)
            .map(schedule => schedule.availability_start_date)
            .filter((date): date is string => !!date) || [],
          startTime: data.activity_schedules?.[0]?.start_time,
          endTime: data.activity_schedules?.[0]?.end_time
        }
      }

      return transformedActivity
    } catch (error) {
      console.error("Error in getActivityById:", error)
      return null
    }
  },

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
          activity_media (*)
        `, { count: "exact" })
        .eq("is_active", true)
        .eq("status", "published")

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

      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error("Error fetching activities:", error)
        return { activities: [], total: 0 }
      }

      const transformedActivities: SupabaseActivity[] = data?.map((activity: any) => ({
        ...activity,
        images: activity.activity_media
          ?.filter((media: any) => media.media_type === "image")
          .map((media: any) => media.media_url) || [],
        videos: activity.activity_media
          ?.filter((media: any) => media.media_type === "video")
          .map((media: any) => ({
            url: media.media_url,
            thumbnail: media.thumbnail_url
          })) || [],
        schedule: { availableDates: [] } // Simplified for list view
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

  async createBooking(bookingData: {
    activityId: number
    customerId: string
    customerName: string
    customerEmail: string
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
          customer_name: bookingData.customerName,
          customer_email: bookingData.customerEmail,
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

      return data
    } catch (error) {
      console.error("Error in createBooking:", error)
      return null
    }
  },

  async getActivityReviews(activityId: string): Promise<any[]> {
    try {
      const id = parseInt(activityId, 10);
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          customer_profiles (
            full_name,
            email
          )
        `)
        .eq("activity_id", id)
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

  async uploadActivityMedia(
    file: File,
    activityId: string,
    mediaType: "image" | "video"
  ): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${activityId}/${mediaType}s/${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from("activity-media")
        .upload(fileName, file)

      if (error) {
        console.error("Error uploading file:", error)
        return null
      }

      const {  { publicUrl } } = supabase.storage
        .from("activity-media")
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error("Error in uploadActivityMedia:", error)
      return null
    }
  }
}
