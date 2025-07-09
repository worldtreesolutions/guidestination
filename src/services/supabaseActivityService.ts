import { supabase } from "@/integrations/supabase/client"

export interface SupabaseActivity {
  id: number
  title: string
  description: string | null
  image_url: string | null
  pickup_location: string | null
  dropoff_location: string | null
  discounts: number | null
  max_participants: number | null
  highlights: string[] | null
  included: string[] | null
  not_included: string[] | null
  meeting_point: string | null
  languages: string[] | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
  b_price: number | null
  status: number | null
  location_lat: number | null
  location_lng: number | null
  place_id: string | null
  address: string | null
  provider_id: string | null
  final_price: number | null
  video_url: string | null
  video_duration: number | null
  video_size: number | null
  video_thumbnail_url: string | null
  duration: string | null
  min_age: number | null
  max_age: number | null
  activity_name: string | null
  technical_skill_level: string | null
  physical_effort_level: string | null
  category: string | null
  average_rating: number | null
  review_count: number | null
  includes_pickup: boolean | null
  pickup_locations: string | null
  includes_meal: boolean | null
  meal_description: string | null
  name: string | null
  requires_approval: boolean
  instant_booking: boolean | null
  cancellation_policy: string | null
  base_price_thb: number | null
  currency_code: string | null
  country_code: string | null
  created_by: string | null
  updated_by: string | null
  meeting_point_place_id: string | null
  meeting_point_lat: number | null
  meeting_point_lng: number | null
  meeting_point_formatted_address: string | null
  dropoff_location_place_id: string | null
  dropoff_location_lat: number | null
  dropoff_location_lng: number | null
  dropoff_location_formatted_address: string | null
  pickup_location_place_id: string | null
  pickup_location_lat: number | null
  pickup_location_lng: number | null
  pickup_location_formatted_address: string | null
  // Add computed properties
  location?: string
  price?: number
  rating?: number
  activity_owners?: {
    id: string
    business_name: string
    contact_email?: string
    contact_phone?: string
  }
  schedule?: {
    available_dates: string[]
    start_time?: string
    end_time?: string
  }
}

export interface ActivityForHomepage {
  id: number
  title: string
  image_url: string | null
  price: number
  location: string | null
  rating?: number
  review_count?: number
  category?: string
}

const supabaseActivityService = {
  async getActivityById(id: number): Promise<SupabaseActivity | null> {
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        activity_owners (
          id,
          business_name,
          email
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching activity:", error)
      return null
    }

    // Transform the data to match our interface
    const activity: SupabaseActivity = {
      ...data,
      image_url: data.image_urls?.[0] || null,
      pickup_location: data.location || null,
      dropoff_location: null,
      discounts: null,
      b_price: data.price,
      status: null,
      location_lat: null,
      location_lng: null,
      place_id: null,
      address: data.location,
      provider_id: data.owner_id,
      final_price: null,
      video_url: null,
      video_duration: null,
      video_size: null,
      video_thumbnail_url: null,
      min_age: null,
      max_age: null,
      activity_name: null,
      technical_skill_level: null,
      physical_effort_level: null,
      category: null,
      average_rating: data.rating,
      includes_pickup: null,
      pickup_locations: null,
      includes_meal: null,
      meal_description: null,
      requires_approval: false,
      instant_booking: null,
      cancellation_policy: null,
      base_price_thb: null,
      currency_code: null,
      country_code: null,
      created_by: null,
      updated_by: null,
      meeting_point_place_id: null,
      meeting_point_lat: null,
      meeting_point_lng: null,
      meeting_point_formatted_address: null,
      dropoff_location_place_id: null,
      dropoff_location_lat: null,
      dropoff_location_lng: null,
      dropoff_location_formatted_address: null,
      pickup_location_place_id: null,
      pickup_location_lat: null,
      pickup_location_lng: null,
      pickup_location_formatted_address: null,
      location: data.location,
      price: data.price,
      rating: data.rating,
      activity_owners: data.activity_owners ? {
        id: data.activity_owners.id,
        business_name: data.activity_owners.business_name,
        contact_email: data.activity_owners.email,
        contact_phone: undefined
      } : undefined,
    }

    return activity
  },

  async getActivityBySlug(slug: string): Promise<SupabaseActivity | null> {
    // For now, treat slug as ID since we don't have slug field
    const id = parseInt(slug)
    if (isNaN(id)) return null
    return this.getActivityById(id)
  },

  async getFeaturedActivities(limit: number = 4): Promise<ActivityForHomepage[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("is_active", true)
      .order("rating", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching featured activities:", error)
      return []
    }

    return this.convertToHomepageFormat(data)
  },

  async getRecommendedActivities(limit: number = 8): Promise<ActivityForHomepage[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("is_active", true)
      .order("review_count", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recommended activities:", error)
      return []
    }

    return this.convertToHomepageFormat(data)
  },

  async getActivitiesByCategory(categoryName: string): Promise<SupabaseActivity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("is_active", true)
      .limit(10)

    if (error) {
      console.error("Error fetching activities by category:", error)
      return []
    }

    return data.map(activity => ({
      ...activity,
      image_url: activity.image_urls?.[0] || null,
      pickup_location: activity.location || null,
      dropoff_location: null,
      discounts: null,
      b_price: activity.price,
      status: null,
      location_lat: null,
      location_lng: null,
      place_id: null,
      address: activity.location,
      provider_id: activity.owner_id,
      final_price: null,
      video_url: null,
      video_duration: null,
      video_size: null,
      video_thumbnail_url: null,
      min_age: null,
      max_age: null,
      activity_name: null,
      technical_skill_level: null,
      physical_effort_level: null,
      category: null,
      average_rating: activity.rating,
      includes_pickup: null,
      pickup_locations: null,
      includes_meal: null,
      meal_description: null,
      requires_approval: false,
      instant_booking: null,
      cancellation_policy: null,
      base_price_thb: null,
      currency_code: null,
      country_code: null,
      created_by: null,
      updated_by: null,
      meeting_point_place_id: null,
      meeting_point_lat: null,
      meeting_point_lng: null,
      meeting_point_formatted_address: null,
      dropoff_location_place_id: null,
      dropoff_location_lat: null,
      dropoff_location_lng: null,
      dropoff_location_formatted_address: null,
      pickup_location_place_id: null,
      pickup_location_lat: null,
      pickup_location_lng: null,
      pickup_location_formatted_address: null,
      location: activity.location,
      price: activity.price,
      rating: activity.rating,
    }))
  },

  convertToHomepageFormat(activities: any[]): ActivityForHomepage[] {
    return activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      image_url: activity.image_urls?.[0] || null,
      price: activity.price || 0,
      location: activity.location,
      rating: activity.rating,
      review_count: activity.review_count,
      category: activity.category
    }))
  },

  async searchActivities(query: string): Promise<SupabaseActivity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("is_active", true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20)

    if (error) {
      console.error("Error searching activities:", error)
      return []
    }

    return data.map(activity => ({
      ...activity,
      image_url: activity.image_urls?.[0] || null,
      pickup_location: activity.location || null,
      dropoff_location: null,
      discounts: null,
      b_price: activity.price,
      status: null,
      location_lat: null,
      location_lng: null,
      place_id: null,
      address: activity.location,
      provider_id: activity.owner_id,
      final_price: null,
      video_url: null,
      video_duration: null,
      video_size: null,
      video_thumbnail_url: null,
      min_age: null,
      max_age: null,
      activity_name: null,
      technical_skill_level: null,
      physical_effort_level: null,
      category: null,
      average_rating: activity.rating,
      includes_pickup: null,
      pickup_locations: null,
      includes_meal: null,
      meal_description: null,
      requires_approval: false,
      instant_booking: null,
      cancellation_policy: null,
      base_price_thb: null,
      currency_code: null,
      country_code: null,
      created_by: null,
      updated_by: null,
      meeting_point_place_id: null,
      meeting_point_lat: null,
      meeting_point_lng: null,
      meeting_point_formatted_address: null,
      dropoff_location_place_id: null,
      dropoff_location_lat: null,
      dropoff_location_lng: null,
      dropoff_location_formatted_address: null,
      pickup_location_place_id: null,
      pickup_location_lat: null,
      pickup_location_lng: null,
      pickup_location_formatted_address: null,
      location: activity.location,
      price: activity.price,
      rating: activity.rating,
    }))
  },

  async addReview(reviewData: {
    activity_id: number
    user_id: string
    rating: number
    comment?: string
  }) {
    const { data, error } = await supabase
      .from("reviews")
      .insert(reviewData)
      .select()
      .single()

    if (error) {
      console.error("Error adding review:", error)
      throw error
    }

    return data
  }
}

export { supabaseActivityService }
