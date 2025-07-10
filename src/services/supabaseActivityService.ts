
import { supabase } from "@/integrations/supabase/client"
import { SupabaseActivity, SupabaseBooking, ActivityForHomepage } from "@/types/activity";

const getActivityById = async (id: string): Promise<SupabaseActivity | null> => {
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

const supabaseActivityService = {
  async getActivityById(id: string): Promise<SupabaseActivity | null> {
    return getActivityById(id);
  },

  async getActivityBySlug(slug: string): Promise<SupabaseActivity | null> {
    return this.getActivityById(slug)
  },

  async getFeaturedActivities(limit: number = 4): Promise<ActivityForHomepage[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*, categories(name)")
      .eq("is_active", true)
      .order("rating", { ascending: false, nullsFirst: false })
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
      .select("*, categories(name)")
      .eq("is_active", true)
      .order("review_count", { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recommended activities:", error)
      return []
    }

    return this.convertToHomepageFormat(data)
  },

  async getActivitiesByCategory(categoryName: string): Promise<SupabaseActivity[]> {
    const {  categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (categoryError || !categoryData) {
      console.error("Error fetching category:", categoryError);
      return [];
    }

    const { data, error } = await supabase
      .from("activities")
      .select("*, categories(name)")
      .eq("is_active", true)
      .eq("category_id", categoryData.id)
      .limit(10)

    if (error) {
      console.error("Error fetching activities by category:", error)
      return []
    }

    return data.map((activity: any) => ({
      ...activity,
      category_name: activity.categories.name,
    })) as SupabaseActivity[];
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
      category_name: activity.categories?.name
    }))
  },

  async searchActivities(query: string): Promise<SupabaseActivity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*, categories(name)")
      .eq("is_active", true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20)

    if (error) {
      console.error("Error searching activities:", error)
      return []
    }

    return data.map((activity: any) => ({
      ...activity,
      category_name: activity.categories.name,
    })) as SupabaseActivity[];
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
    let query = supabase
      .from("activities")
      .select("*, categories(name)")
      .eq("is_active", true)

    if (filters.category) {
      query = query.eq('categories.name', filters.category)
    }
    
    const { data, error } = await query.limit(10)

    if (error) {
      console.error("Error fetching activities:", error)
      return []
    }

    return data.map((activity: any) => ({
      ...activity,
      category_name: activity.categories.name,
    })) as SupabaseActivity[];
  },

  async getActivitiesForHomepage(): Promise<ActivityForHomepage[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*, categories(name)")
      .eq("is_active", true)
      .limit(10)

    if (error) {
      console.error("Error fetching activities for homepage:", error)
      return []
    }

    return this.convertToHomepageFormat(data);
  },
}

const fetchActivitiesByOwner = async (ownerId: string): Promise<SupabaseActivity[]> => {
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

const fetchRecentBookingsForOwner = async (ownerId: string): Promise<SupabaseBooking[]> => {
  const { data, error } = await supabase
    .rpc('get_recent_bookings_for_owner', { owner_id_param: ownerId })

  if (error) {
    console.error("Error fetching recent bookings:", error);
    throw error;
  }

  return data as SupabaseBooking[];
};

const fetchBookingsForOwner = async (ownerId: string): Promise<SupabaseBooking[]> => {
  const { data, error } = await supabase
    .rpc('get_bookings_for_owner', { owner_id_param: ownerId })

  if (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }

  return data as SupabaseBooking[];
};

const fetchEarningsForOwner = async (ownerId: string) => {
  const { data, error } = await supabase
    .rpc('get_earnings_for_owner', { owner_id_param: ownerId })

  if (error) {
    console.error("Error fetching earnings for owner:", error);
    return {
      total: 0,
      monthly: [],
      pending: 0,
    };
  }

  return data[0];
};

const deleteActivity = async (activityId: number) => {
  const { error } = await supabase.from('activities').delete().eq('id', activityId);
  if (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

export { 
  supabaseActivityService, 
  fetchActivitiesByOwner, 
  fetchRecentBookingsForOwner, 
  fetchBookingsForOwner, 
  fetchEarningsForOwner,
  getActivityById,
  deleteActivity
};
  