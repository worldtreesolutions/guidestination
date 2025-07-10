import { supabase } from "@/integrations/supabase/client"
import { SupabaseActivity, ActivityForHomepage, SupabaseBooking, Earning } from "@/types/activity"

export const supabaseActivityService = {
  async getFeaturedActivities(limit: number = 4): Promise<SupabaseActivity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_media(media_url, media_type, thumbnail_url)
        `)
        .eq("is_active", true)
        .order("average_rating", { ascending: false, nullsFirst: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching featured activities:", error)
        throw error
      }

      return this.transformActivities(data || [])
    } catch (error) {
      console.error("Error fetching featured activities:", error)
      throw error
    }
  },

  async getRecommendedActivities(limit: number = 8): Promise<SupabaseActivity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_media(media_url, media_type, thumbnail_url)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching recommended activities:", error)
        throw error
      }

      return this.transformActivities(data || [])
    } catch (error) {
      console.error("Error fetching recommended activities:", error)
      throw error
    }
  },

  async getActivitiesByCategory(categoryName: string, limit: number = 10): Promise<SupabaseActivity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_media(media_url, media_type, thumbnail_url)
        `)
        .eq("is_active", true)
        .eq("category", categoryName)
        .limit(limit)

      if (error) {
        console.error("Error fetching activities by category:", error)
        throw error
      }

      return this.transformActivities(data || [])
    } catch (error) {
      console.error("Error fetching activities by category:", error)
      throw error
    }
  },

  async getActivityById(id: string): Promise<SupabaseActivity> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_media(media_url, media_type, thumbnail_url),
          activity_schedules(
            id,
            capacity,
            booked_count,
            availability_start_date,
            availability_end_date,
            start_time,
            end_time,
            is_active
          )
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single()

      if (error) {
        console.error("Error fetching activity by ID:", error)
        throw error
      }

      if (!data) {
        throw new Error("Activity not found")
      }

      return this.transformActivity(data)
    } catch (error) {
      console.error("Error fetching activity by ID:", error)
      throw error
    }
  },

  async getAllActivities(limit?: number): Promise<SupabaseActivity[]> {
    try {
      let query = supabase
        .from("activities")
        .select(`
          *,
          activity_media(media_url, media_type, thumbnail_url)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching all activities:", error)
        throw error
      }

      return this.transformActivities(data || [])
    } catch (error) {
      console.error("Error fetching all activities:", error)
      throw error
    }
  },

  async searchActivities(searchTerm: string, limit: number = 20): Promise<SupabaseActivity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_media(media_url, media_type, thumbnail_url)
        `)
        .eq("is_active", true)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .limit(limit)

      if (error) {
        console.error("Error searching activities:", error)
        throw error
      }

      return this.transformActivities(data || [])
    } catch (error) {
      console.error("Error searching activities:", error)
      throw error
    }
  },

  async fetchActivitiesByOwner(providerId: string): Promise<SupabaseActivity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_media(media_url, media_type, thumbnail_url)
        `)
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching activities by provider:", error)
        throw error
      }

      return this.transformActivities(data || [])
    } catch (error) {
      console.error("Error fetching activities by provider:", error)
      throw error
    }
  },

  async createActivity(activityData: Partial<SupabaseActivity>): Promise<SupabaseActivity> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .insert([{
          title: activityData.title || "",
          description: activityData.description || null,
          category: activityData.category || "",
          base_price_thb: activityData.price || 0,
          max_participants: activityData.max_participants || 0,
          duration: activityData.duration || 0,
          meeting_point: activityData.meeting_point || null,
          includes_pickup: activityData.includes_pickup || false,
          pickup_locations: activityData.pickup_locations || null,
          includes_meal: activityData.includes_meal || false,
          meal_description: activityData.meal_description || null,
          highlights: activityData.highlights ? JSON.stringify(activityData.highlights) : null,
          included: activityData.included ? JSON.stringify(activityData.included) : null,
          not_included: activityData.not_included ? JSON.stringify(activityData.not_included) : null,
          languages: activityData.languages ? JSON.stringify(activityData.languages) : null,
          provider_id: activityData.provider_id || "",
          is_active: true
        }])
        .select()
        .single()

      if (error) {
        console.error("Error creating activity:", error)
        throw error
      }

      return this.transformActivity(data)
    } catch (error) {
      console.error("Error creating activity:", error)
      throw error
    }
  },

  async updateActivity(id: string, activityData: Partial<SupabaseActivity>): Promise<SupabaseActivity> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (activityData.title) updateData.title = activityData.title
      if (activityData.description) updateData.description = activityData.description
      if (activityData.category) updateData.category = activityData.category
      if (activityData.price) updateData.base_price_thb = activityData.price
      if (activityData.max_participants) updateData.max_participants = activityData.max_participants
      if (activityData.duration) updateData.duration = activityData.duration
      if (activityData.meeting_point) updateData.meeting_point = activityData.meeting_point
      if (activityData.includes_pickup !== undefined) updateData.includes_pickup = activityData.includes_pickup
      if (activityData.pickup_locations) updateData.pickup_locations = activityData.pickup_locations
      if (activityData.includes_meal !== undefined) updateData.includes_meal = activityData.includes_meal
      if (activityData.meal_description) updateData.meal_description = activityData.meal_description
      if (activityData.highlights) updateData.highlights = JSON.stringify(activityData.highlights)
      if (activityData.included) updateData.included = JSON.stringify(activityData.included)
      if (activityData.not_included) updateData.not_included = JSON.stringify(activityData.not_included)
      if (activityData.languages) updateData.languages = JSON.stringify(activityData.languages)

      const { data, error } = await supabase
        .from("activities")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating activity:", error)
        throw error
      }

      return this.transformActivity(data)
    } catch (error) {
      console.error("Error updating activity:", error)
      throw error
    }
  },

  async deleteActivity(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("activities")
        .update({ is_active: false })
        .eq("id", id)

      if (error) {
        console.error("Error deleting activity:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Error deleting activity:", error)
      throw error
    }
  },

  async fetchBookingsForOwner(ownerId: string): Promise<SupabaseBooking[]> {
    // This is a placeholder implementation.
    console.log("Fetching bookings for owner:", ownerId)
    return Promise.resolve([])
  },

  async fetchRecentBookingsForOwner(ownerId: string): Promise<SupabaseBooking[]> {
    // This is a placeholder implementation.
    console.log("Fetching recent bookings for owner:", ownerId)
    return Promise.resolve([])
  },

  async fetchEarningsForOwner(ownerId: string): Promise<any> {
    // This is a placeholder implementation.
    console.log("Fetching earnings for owner:", ownerId)
    return Promise.resolve({ total: 0, monthly: [], pending: 0 })
  },

  transformActivity(data: any): SupabaseActivity {
    const imageUrls = data.activity_media
      ?.filter((media: any) => media.media_type === "image")
      ?.map((media: any) => media.media_url) || []

    if (data.image_url && !imageUrls.includes(data.image_url)) {
      imageUrls.unshift(data.image_url)
    }

    // Ensure numeric values are properly converted
    const rating = data.average_rating ? parseFloat(data.average_rating) : 0
    const price = data.base_price_thb ? parseFloat(data.base_price_thb) : 0

    return {
      id: String(data.id),
      title: data.title || data.name || data.activity_name || "",
      name: data.name || data.title || data.activity_name || "",
      description: data.description || "",
      category: data.category || "",
      category_name: data.category || "",
      price: price,
      max_participants: data.max_participants || 10,
      duration: data.duration,
      location: data.address || data.meeting_point_formatted_address || "",
      meeting_point: data.meeting_point || "",
      includes_pickup: data.includes_pickup || false,
      pickup_locations: data.pickup_locations || data.pickup_location || "",
      includes_meal: data.includes_meal || false,
      meal_description: data.meal_description || "",
      highlights: this.parseJsonField(data.highlights),
      included: this.parseJsonField(data.included),
      not_included: this.parseJsonField(data.not_included),
      languages: this.parseJsonField(data.languages) || ["English"],
      rating: rating,
      review_count: data.review_count || 0,
      image_urls: imageUrls,
      video_url: data.video_url || "",
      provider_id: data.provider_id || "",
      is_active: data.is_active || false,
      created_at: data.created_at || "",
      updated_at: data.updated_at || "",
      schedules: {
        availableDates: data.activity_schedules?.map((schedule: any) => ({
          date: schedule.availability_start_date,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          capacity: schedule.capacity,
          booked: schedule.booked_count || 0,
          available: schedule.capacity - (schedule.booked_count || 0)
        })) || []
      }
    }
  },

  transformActivities(data: any[]): SupabaseActivity[] {
    return data.map(item => this.transformActivity(item))
  },

  convertToHomepageFormat(activities: SupabaseActivity[]): ActivityForHomepage[] {
    return activities.map(activity => ({
      id: String(activity.id),
      title: activity.title,
      name: activity.name,
      description: activity.description,
      category: activity.category,
      category_name: activity.category_name,
      price: typeof activity.price === 'number' ? activity.price : 0,
      rating: typeof activity.rating === 'number' ? activity.rating : 0,
      review_count: activity.review_count,
      image_url: activity.image_urls?.[0] || "https://images.unsplash.com/photo-1563492065-1a83e8c6b8d8",
      image_urls: activity.image_urls,
      location: activity.location,
      duration: activity.duration,
      provider_id: activity.provider_id
    }))
  },

  parseJsonField(field: any): any {
    if (!field) return null
    if (typeof field === "string") {
      try {
        return JSON.parse(field)
      } catch {
        return field.split(",").map((item: string) => item.trim()).filter(Boolean)
      }
    }
    return field
  },

  async getActivities(filters: any = {}): Promise<SupabaseActivity[]> {
    try {
      let query = supabase
        .from("activities")
        .select(`
          *,
          activity_media(media_url, media_type, thumbnail_url)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (filters.category) {
        query = query.eq("category", filters.category)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching activities:", error)
        throw error
      }

      return this.transformActivities(data || [])
    } catch (error) {
      console.error("Error fetching activities:", error)
      throw error
    }
  }
}
