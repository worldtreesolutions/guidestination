
import { supabase } from "@/integrations/supabase/client"
import { SupabaseActivity, SupabaseBooking, ActivityForHomepage } from "@/types/activity";

const getActivityById = async (id: string): Promise<SupabaseActivity | null> => {
  const { data, error } = await supabase
    .from('activities')
    .select('*, categories(name)')
    .eq('id', parseInt(id, 10))
    .single();

  if (error) {
    console.error('Error fetching activity by id:', error);
    return null;
  }
  if (!data) return null;

  return {
    ...data,
    category_name: data.categories?.name || 'N/A',
  } as unknown as SupabaseActivity;
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
    const { data: categoryData, error: categoryError } = await supabase
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
      const { data: categoryData } = await supabase.from('categories').select('id').eq('name', filters.category).single();
      if (categoryData) {
        query = query.eq('category_id', categoryData.id)
      }
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
    category_name: activity.categories?.name || "Uncategorized",
    name: activity.title,
    min_participants: activity.min_participants || 1,
    inclusions: activity.included || [],
    exclusions: activity.not_included || [],
    additional_info: activity.additional_info || null,
    booking_type: activity.booking_type || "instant"
  })) as SupabaseActivity[];
};

const fetchRecentBookingsForOwner = async (ownerId: string): Promise<SupabaseBooking[]> => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        activities(title),
        profiles(full_name, email)
      `)
      .eq("activities.owner_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching recent bookings:", error);
      return [];
    }

    return (data || []).map((booking: any) => ({
      ...booking,
      activityTitle: booking.activities?.title || "Unknown Activity",
      customerName: booking.profiles?.full_name || "Unknown Customer",
      customerEmail: booking.profiles?.email || "Unknown Email",
      date: booking.booking_date,
      bookingTime: new Date(booking.created_at).toLocaleTimeString(),
      providerAmount: booking.total_price * 0.85,
      platformFee: booking.total_price * 0.15,
      totalAmount: booking.total_price
    })) as SupabaseBooking[];
  } catch (error) {
    console.error("Error in fetchRecentBookingsForOwner:", error);
    return [];
  }
};

const fetchBookingsForOwner = async (ownerId: string): Promise<SupabaseBooking[]> => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        activities(title),
        profiles(full_name, email)
      `)
      .eq("activities.owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }

    return (data || []).map((booking: any) => ({
      ...booking,
      activityTitle: booking.activities?.title || "Unknown Activity",
      customerName: booking.profiles?.full_name || "Unknown Customer",
      customerEmail: booking.profiles?.email || "Unknown Email",
      date: booking.booking_date,
      bookingTime: new Date(booking.created_at).toLocaleTimeString(),
      providerAmount: booking.total_price * 0.85,
      platformFee: booking.total_price * 0.15,
      totalAmount: booking.total_price
    })) as SupabaseBooking[];
  } catch (error) {
    console.error("Error in fetchBookingsForOwner:", error);
    return [];
  }
};

type EarningsData = {
  total: number;
  monthly: { month: string; amount: number }[];
  pending: number;
};

const fetchEarningsForOwner = async (ownerId: string): Promise<EarningsData> => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("total_price, created_at, status")
      .eq("activities.owner_id", ownerId);

    if (error) {
      console.error("Error fetching earnings:", error);
      return {
        total: 0,
        monthly: [],
        pending: 0,
      };
    }

    const bookings = data || [];
    const total = bookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + (b.total_price * 0.85), 0);

    const pending = bookings
      .filter(b => b.status === "confirmed")
      .reduce((sum, b) => sum + (b.total_price * 0.85), 0);

    // Generate mock monthly data
    const monthly = [
      { month: "Jan", amount: Math.floor(Math.random() * 10000) + 5000 },
      { month: "Feb", amount: Math.floor(Math.random() * 10000) + 5000 },
      { month: "Mar", amount: Math.floor(Math.random() * 10000) + 5000 },
      { month: "Apr", amount: Math.floor(Math.random() * 10000) + 5000 },
      { month: "May", amount: Math.floor(Math.random() * 10000) + 5000 },
      { month: "Jun", amount: Math.floor(Math.random() * 10000) + 5000 },
    ];

    return {
      total,
      monthly,
      pending,
    };
  } catch (error) {
    console.error("Error in fetchEarningsForOwner:", error);
    return {
      total: 0,
      monthly: [],
      pending: 0,
    };
  }
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
