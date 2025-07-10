import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types";
import { SupabaseActivity, SupabaseBooking } from "@/types/activity";

export const supabaseActivityService = {
  async getActivityById(id: string): Promise<SupabaseActivity | null> {
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
  },

  async getActivities(filters: any): Promise<SupabaseActivity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("is_active", true)
      .limit(10)

    if (error) {
      console.error("Error fetching activities:", error)
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

  async getActivitiesForHomepage() {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("is_active", true)
      .limit(10)

    if (error) {
      console.error("Error fetching activities for homepage:", error)
      return []
    }

    return data.map(activity => ({
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
}

export { supabaseActivityService }

export const fetchActivitiesByOwner = async (ownerId: string): Promise<SupabaseActivity[]> => {
  const { data, error } = await supabase
    .from("activities")
    .select("*, categories(name)")
    .eq("owner_id", ownerId);

  if (error) {
    console.error("Error fetching activities by owner:", error);
    throw error;
  }

  return data.map((activity: any) => ({
    ...activity,
    category_name: activity.categories.name,
  })) as SupabaseActivity[];
};

export const fetchRecentBookingsForOwner = async (ownerId: string): Promise<SupabaseBooking[]> => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, activities(title)")
    .eq("activities.owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching recent bookings:", error);
    throw error;
  }

  return data.map((booking: any) => ({
    ...booking,
    id: booking.id,
    activityTitle: booking.activities.title,
    customerName: "Customer Name", // Placeholder
    customerEmail: "customer@example.com", // Placeholder
    date: booking.booking_date,
    time: "10:00", // Placeholder
    participants: booking.participants,
    providerAmount: booking.total_price * 0.9, // Placeholder
    platformFee: booking.total_price * 0.1, // Placeholder
    totalAmount: booking.total_price,
    status: booking.status,
  })) as SupabaseBooking[];
};

export const fetchBookingsForOwner = async (ownerId: string): Promise<SupabaseBooking[]> => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, activities(title, owner_id)")
    .eq("activities.owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }

  return data.map((booking: any) => ({
    ...booking,
    id: booking.id,
    activityTitle: booking.activities.title,
    customerName: "Customer Name", // Placeholder
    customerEmail: "customer@example.com", // Placeholder
    date: booking.booking_date,
    time: "10:00", // Placeholder
    participants: booking.participants,
    providerAmount: booking.total_price * 0.9, // Placeholder
    platformFee: booking.total_price * 0.1, // Placeholder
    totalAmount: booking.total_price,
    status: booking.status,
  })) as SupabaseBooking[];
};

export const fetchEarningsForOwner = async (ownerId: string) => {
  // This is a placeholder. You'll need to implement the actual logic.
  return {
    total: 50000,
    monthly: [
      { month: "Jan", amount: 5000 },
      { month: "Feb", amount: 7000 },
      { month: "Mar", amount: 6000 },
      { month: "Apr", amount: 8000 },
    ],
    pending: 2000,
  };
};

export const getActivityById = async (id: string): Promise<SupabaseActivity | null> => {
  const { data, error } = await supabase
    .from('activities')
    .select('*, categories(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching activity by id:', error);
    return null;
  }
  if (!data) return null;

  return {
    ...data,
    category_name: data.categories?.name || 'N/A',
  } as SupabaseActivity;
};
