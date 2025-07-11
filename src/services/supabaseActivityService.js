
import { supabase } from "@/integrations/supabase/client"

export const supabaseActivityService = {
  async getActivities(filters) {
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

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching activities:", error)
        throw error
      }
      
      const activities = data?.map((activity) => ({
        ...activity,
        category_name: activity.categories?.name || "Uncategorized",
        image_url: activity.image_urls?.[0] || null,
        rating: activity.average_rating || 0,
        location: activity.location || activity.address || "Location TBD"
      })) || []

      return activities;

    } catch (error) {
      console.error("Error in getActivities:", error)
      throw error
    }
  },

  async getActivityById(id) {
    try {
      console.log(`[Service] Fetching activity with ID: ${id}`);
      
      const { data: activity, error: activityError } = await supabase
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

      const { data: scheduleData, error: scheduleError } = await supabase
        .from("activity_schedules")
        .select("*")
        .eq("activity_id", id)
        .eq("is_active", true);

      if (scheduleError) {
        console.error("[Service] Error fetching schedule:", scheduleError.message);
      }
      console.log("[Service] Raw schedule data:", scheduleData);

      const { data: optionsData, error: optionsError } = await supabase
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
      console.log("[Service] Raw options data:", optionsData);

      // Generate schedule instances
      const generateScheduleInstances = (schedules) => {
        if (!schedules || !Array.isArray(schedules)) return [];
        
        const instances = [];
        
        schedules.forEach(schedule => {
          if (schedule.recurrence_pattern === 'once') {
            const scheduleDate = schedule.availability_start_date || new Date().toISOString().split('T')[0];
            instances.push({
              date: scheduleDate,
              startTime: schedule.start_time ? schedule.start_time.substring(0, 5) : "09:00",
              endTime: schedule.end_time ? schedule.end_time.substring(0, 5) : "17:00",
              capacity: schedule.capacity || 10,
              booked: schedule.booked_count || 0,
              available: (schedule.capacity || 10) - (schedule.booked_count || 0),
              price: parseFloat(schedule.price_override || activity.price?.toString() || '0')
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
                  startTime: schedule.start_time ? schedule.start_time.substring(0, 5) : "09:00",
                  endTime: schedule.end_time ? schedule.end_time.substring(0, 5) : "17:00",
                  capacity: schedule.capacity || 10,
                  booked: schedule.booked_count || 0,
                  available: (schedule.capacity || 10) - (schedule.booked_count || 0),
                  price: parseFloat(schedule.price_override || activity.price?.toString() || '0')
                });
              }
              
              currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
          }
        });
        
        return instances;
      };

      const formattedSchedules = generateScheduleInstances(scheduleData);
      console.log("[Service] Formatted schedules (availableDates):", formattedSchedules);

      // Format options data
      const formattedOptions = optionsData && Array.isArray(optionsData)
        ? optionsData.map((selectedOption) => ({
            id: selectedOption.activity_options?.id?.toString() || '',
            option_name: selectedOption.activity_options?.label || '',
            option_type: selectedOption.activity_options?.type || '',
            is_selected: selectedOption.is_selected || false
          }))
        : [];

      console.log("[Service] Formatted options:", formattedOptions);

      // Build the result object with all required fields
      const result = {
        id: activity.id,
        title: activity.title || '',
        name: activity.name || activity.title || '',
        description: activity.description || null,
        category: activity.categories?.name || "Uncategorized",
        category_name: activity.categories?.name || "Uncategorized",
        price: activity.price || null,
        max_participants: activity.max_participants || null,
        duration: activity.duration || null,
        min_age: activity.min_age || null,
        max_age: activity.max_age || null,
        physical_effort_level: activity.physical_effort_level || null,
        technical_skill_level: activity.technical_skill_level || null,
        location: activity.location || null,
        address: activity.address || null,
        meeting_point: activity.meeting_point || null,
        includes_pickup: activity.includes_pickup || false,
        pickup_locations: activity.pickup_locations || null,
        includes_meal: activity.includes_meal || false,
        meal_description: activity.meal_description || null,
        highlights: activity.highlights || null,
        included: activity.included || null,
        not_included: activity.not_included || null,
        languages: activity.languages || null,
        rating: activity.average_rating || activity.rating || null,
        average_rating: activity.average_rating || null,
        review_count: activity.review_count || null,
        image_urls: activity.image_urls || null,
        image_url: activity.image_urls?.[0] || null,
        video_url: activity.video_url || null,
        provider_id: activity.provider_id || '',
        is_active: activity.is_active || true,
        created_at: activity.created_at || '',
        updated_at: activity.updated_at || '',
        schedules: {
          availableDates: formattedSchedules
        },
        activity_selected_options: formattedOptions,
        selectedOptions: undefined,
        status: undefined,
        booking_type: undefined,
      };

      console.log("[Service] Final activity object to be returned:", result);
      return result;
    } catch (error) {
      console.error("[Service] Critical error in getActivityById:", error);
      return null;
    }
  },

  async createActivity(activityData) {
    const { data, error } = await supabase
        .from("activities")
        .insert([activityData])
        .select()
        .single()

    if (error) throw error
    return data
  },

  async updateActivity(id, activityData) {
    const { data, error } = await supabase
        .from("activities")
        .update(activityData)
        .eq("id", id)
        .select()
        .single()
    if (error) throw error
    return data
  },

  async deleteActivity(id) {
    const { error } = await supabase
        .from("activities")
        .update({ is_active: false })
        .eq("id", id)
    if (error) throw error
    return true
  },

  async getActivitiesByProvider(providerId) {
    return this.getActivities({ location: providerId });
  },

  async searchActivities(searchTerm, filters) {
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

  async uploadActivityMedia(activityId, files) {
    return []
  },

  async getActivityReviews(activityId) {
    const { data, error } = await supabase
        .from("reviews")
        .select("*, customer_profiles(full_name, first_name, last_name)")
        .eq("activity_id", activityId)
    if (error) throw error
    return data || []
  },

  async createActivityReview(reviewData) {
    const { data, error } = await supabase
        .from("reviews")
        .insert([reviewData])
        .select()
        .single()
    if (error) throw error
    await this.updateActivityRating(reviewData.activity_id)
    return data
  },

  async updateActivityRating(activityId) {
    const { data: reviews, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("activity_id", activityId)
    if (error || !reviews) return

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length
    await supabase.from("activities").update({ average_rating: averageRating, review_count: reviews.length }).eq("id", activityId)
  },

  async fetchActivitiesByOwner(ownerId) { return []; },
  async fetchBookingsForOwner(ownerId) { return []; },
  async fetchRecentBookingsForOwner(ownerId) { return []; },
  async fetchEarningsForOwner(ownerId) { 
    return { total: 0, monthly: [], pending: 0 }; 
  },
  async getFeaturedActivities() { return this.getActivities({ limit: 5 }); },
  async getRecommendedActivities() { return this.getActivities({ limit: 5 }); },
  async getActivitiesByCategory(category) { return this.getActivities({ category, limit: 4 }); },
  async convertToHomepageFormat(activities) { return activities; },
  async getAllActivities() { return this.getActivities({}); }
}

export default supabaseActivityService
