
import { supabase } from "@/integrations/supabase/client"
import { SupabaseActivity, Earning, ActivityForHomepage } from "@/types/activity"

export const supabaseActivityService = {
  async getActivities(filters?: {
    category?: string
    location?: string
    priceRange?: [number, number]
    limit?: number
    offset?: number
  }) {
    try {
      let query = supabase
        .from("activities")
        .select(`
          id,
          title,
          name,
          description,
          price,
          average_rating,
          review_count,
          address,
          location,
          duration,
          provider_id,
          image_urls,
          categories (name)
        `)
        .eq("is_active", true)

      if (filters?.category) {
        // @ts-ignore
        query = query.eq("categories.name", filters.category)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching activities:", error)
        throw error
      }
      
      const activities = data?.map((activity: any) => ({
        ...activity,
        category_name: activity.categories?.name || "Uncategorized",
        image_url: activity.image_urls?.[0] || null,
        rating: activity.average_rating || 0,
        location: activity.location || activity.address || "Location TBD"
      })) || []

      return activities as ActivityForHomepage[];

    } catch (error) {
      console.error("Error in getActivities:", error)
      throw error
    }
  },

  async getActivityById(id: number): Promise<SupabaseActivity | null> {
    try {
      console.log(`[Service] Fetching activity with ID: ${id}`);
      
      const {  activity, error: activityError } = await supabase
        .from("activities")
        .select(`
          *,
          categories (name)
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (activityError) {
        console.error("[Service] Error fetching activity:", activityError.message);
        throw activityError;
      }

      if (!activity) {
        console.warn(`[Service] Activity with ID ${id} not found.`);
        return null;
      }

      console.log("[Service] Raw activity data fetched:", activity);

      // @ts-ignore - Bypassing type error due to out-of-sync Supabase types
      const {  scheduleData, error: scheduleError } = await supabase
        .from("activity_schedules")
        .select("*")
        .eq("activity_id", id)
        .eq("is_active", true);

      if (scheduleError) {
        console.error("[Service] Error fetching schedule:", scheduleError.message);
      }
      console.log("[Service] Raw schedule ", scheduleData);

      // @ts-ignore - Bypassing type error due to out-of-sync Supabase types
      const {  optionsData, error: optionsError } = await supabase
        .from('activity_selected_options')
        .select(`
          is_selected,
          activity_options (
            id,
            label,
            type
          )
        `)
        .eq('activity_id', id)
        .eq('is_selected', true);

      if (optionsError) {
        console.error("[Service] Error fetching options:", optionsError.message);
      }
      console.log("[Service] Raw options ", optionsData);

      const generateScheduleInstances = (schedules: any[]) => {
        const instances: any[] = [];
        
        schedules.forEach(schedule => {
          if (schedule.recurrence_pattern === 'once') {
            const scheduleDate = schedule.availability_start_date || new Date().toISOString().split('T')[0];
            instances.push({
              date: scheduleDate,
              startTime: schedule.start_time.substring(0, 5),
              endTime: schedule.end_time.substring(0, 5),
              capacity: schedule.capacity,
              booked: schedule.booked_count || 0,
              available: schedule.capacity - (schedule.booked_count || 0),
              price: parseFloat(schedule.price_override || activity.price || 0)
            });
          } else if (schedule.recurrence_pattern === 'weekly' && schedule.recurrence_day_of_week) {
            const startDate = new Date(schedule.availability_start_date || new Date());
            const endDate = new Date(schedule.availability_end_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
            
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              const dayOfWeek = currentDate.getUTCDay();
              
              if (schedule.recurrence_day_of_week.includes(dayOfWeek)) {
                instances.push({
                  date: currentDate.toISOString().split('T')[0],
                  startTime: schedule.start_time.substring(0, 5),
                  endTime: schedule.end_time.substring(0, 5),
                  capacity: schedule.capacity,
                  booked: schedule.booked_count || 0,
                  available: schedule.capacity - (schedule.booked_count || 0),
                  price: parseFloat(schedule.price_override || activity.price || 0)
                });
              }
              
              currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
          }
        });
        
        return instances;
      };

      const formattedSchedules = scheduleData && Array.isArray(scheduleData)
        ? generateScheduleInstances(scheduleData.filter((schedule: any) => schedule.is_active))
        : [];

      console.log("[Service] Formatted schedules (availableDates):", formattedSchedules);

      const formattedOptions = optionsData && Array.isArray(optionsData)
        ? optionsData.map((selectedOption: any) => ({
            id: selectedOption.activity_options?.id?.toString() || '',
            option_name: selectedOption.activity_options?.label || '',
            option_type: selectedOption.activity_options?.type || '',
            is_selected: selectedOption.is_selected
          }))
        : [];

      console.log("[Service] Formatted options:", formattedOptions);

      const result: SupabaseActivity = {
        id: activity.id,
        title: activity.title,
        name: activity.name || activity.title,
        description: activity.description,
        category: (activity.categories as any)?.name || "Uncategorized",
        category_name: (activity.categories as any)?.name || "Uncategorized",
        price: activity.price,
        max_participants: activity.max_participants,
        duration: activity.duration,
        min_age: activity.min_age,
        max_age: activity.max_age,
        physical_effort_level: activity.physical_effort_level,
        technical_skill_level: activity.technical_skill_level,
        location: activity.location,
        address: activity.address,
        meeting_point: activity.meeting_point,
        includes_pickup: activity.includes_pickup,
        pickup_locations: activity.pickup_locations,
        includes_meal: activity.includes_meal,
        meal_description: activity.meal_description,
        highlights: activity.highlights,
        included: activity.included,
        not_included: activity.not_included,
        languages: activity.languages,
        rating: activity.average_rating || activity.rating || 0,
        average_rating: activity.average_rating,
        review_count: activity.review_count,
        image_urls: activity.image_urls,
        image_url: activity.image_urls?.[0] || null,
        video_url: activity.video_url,
        provider_id: activity.provider_id,
        is_active: activity.is_active,
        created_at: activity.created_at,
        updated_at: activity.updated_at,
        schedules: {
          availableDates: formattedSchedules
        },
        activity_selected_options: formattedOptions,
        status: activity.status,
        booking_type: activity.booking_type,
      };

      console.log("[Service] Final activity object to be returned:", result);
      return result;
    } catch (error) {
      console.error("[Service] Critical error in getActivityById:", error);
      throw error;
    }
  },

  async createActivity(activityData: Partial<SupabaseActivity>) {
    const { data, error } = await supabase
        .from("activities")
        .insert([activityData] as any)
        .select()
        .single()

    if (error) throw error
    return data
  },

  async updateActivity(id: number, activityData: Partial<SupabaseActivity>) {
    const { data, error } = await supabase
        .from("activities")
        .update(activityData as any)
        .eq("id", id)
        .select()
        .single()
    if (error) throw error
    return data
  },

  async deleteActivity(id: number) {
    const { error } = await supabase
        .from("activities")
        .update({ is_active: false })
        .eq("id", id)
    if (error) throw error
    return true
  },

  async getActivitiesByProvider(providerId: string) {
    return this.getActivities({ location: providerId });
  },

  async searchActivities(searchTerm: string, filters?: any) {
    return this.getActivities(filters);
  },

  async getActivityCategories() {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name")
    if (error) throw error
    return data || []
  },

  async uploadActivityMedia(activityId: number, files: File[]) {
    return []
  },

  async getActivityReviews(activityId: number) {
    const { data, error } = await supabase
        .from("reviews")
        .select("*, customer_profiles(full_name, first_name, last_name)")
        .eq("activity_id", activityId)
    if (error) throw error
    return data || []
  },

  async createActivityReview(reviewData: any) {
    const { data, error } = await supabase
        .from("reviews")
        .insert([reviewData])
        .select()
        .single()
    if (error) throw error
    await this.updateActivityRating(reviewData.activity_id)
    return data
  },

  async updateActivityRating(activityId: number) {
    const {  reviews, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("activity_id", activityId)
    if (error || !reviews) return

    const totalRating = reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length
    await supabase.from("activities").update({ average_rating: averageRating, review_count: reviews.length }).eq("id", activityId)
  },

  async fetchActivitiesByOwner(ownerId: string) { return []; },
  async fetchBookingsForOwner(ownerId: string) { return []; },
  async fetchRecentBookingsForOwner(ownerId: string) { return []; },
  async fetchEarningsForOwner(ownerId: string): Promise<Earning> { 
    return { total: 0, monthly: [], pending: 0 }; 
  },
  async getFeaturedActivities() { return this.getActivities({ limit: 5 }); },
  async getRecommendedActivities() { return this.getActivities({ limit: 5 }); },
  async getActivitiesByCategory(category: string) { return this.getActivities({ category, limit: 4 }); },
  async convertToHomepageFormat(activities: any[]) { return activities; },
  async getAllActivities() { return this.getActivities({}); }
}

export default supabaseActivityService
