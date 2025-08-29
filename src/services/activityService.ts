
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { ActivityForHomepage, ActivityWithDetails, ActivitySchedule, Booking, BaseBooking } from "@/types/activity";

const activityService = {
  /**
   * New searchActivities method: fetches activities by destination, date, and available spots
   * Does not modify any existing functions
   */
  async searchActivities(destination: string, date?: Date, guests?: string) {
    let searchDateLocal = undefined;
    if (date) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      searchDateLocal = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return [];
    }
    // Step 1: Build filters for activity_schedule_instances
    const scheduleFilters: Record<string, any> = { is_active: true };
    if (searchDateLocal) {
      scheduleFilters["scheduled_date"] = searchDateLocal;
    }
    if (guests && !isNaN(Number(guests))) {
      scheduleFilters["available_spots"] = { gte: Number(guests) };
    }

    // Step 2: Build Supabase query with filters
    let scheduleQuery = supabase
      .from("activity_schedule_instances")
      .select("activity_id");

    // Apply filters
    Object.entries(scheduleFilters).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null && "gte" in value) {
        scheduleQuery = (scheduleQuery as any).gte(key, value.gte);
      } else {
        scheduleQuery = (scheduleQuery as any).eq(key, value);
      }
    });

    const { data: scheduleData, error: scheduleError } = await scheduleQuery;
    // ...existing code...
    if (scheduleError) {
      console.error("Error searching schedule instances:", scheduleError);
      return [];
    }
    if (!scheduleData || scheduleData.length === 0) {
      return [];
    }

    // Step 3: Get unique activity_ids
    const activityIds = Array.from(new Set(scheduleData.map((row: any) => row.activity_id).filter(Boolean)));
    if (activityIds.length === 0) {
      return [];
    }

    // Step 4: Query activities by activity_id and destination
    let activityQuery = supabase
      .from("activities")
      .select(`*, activity_schedules(*), reviews(*, customers(full_name))`)
      .in("id", activityIds)
      .eq("is_active", true);

    if (destination && destination.trim() !== "") {
      activityQuery = activityQuery.ilike("address", `%${destination}%`);
    }

    const { data: activitiesData, error: activitiesError } = await activityQuery;
    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
      return [];
    }
    if (!activitiesData) {
      return [];
    }

    // Step 5: Get unique category names to fetch category details
    const categoryNames = Array.from(new Set(activitiesData.map((activity: any) => activity.category).filter(Boolean)));
    let categoriesMap: Record<string, any> = {};
    if (categoryNames.length > 0) {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .in("name", categoryNames);
      if (!categoriesError && categoriesData) {
        categoriesMap = categoriesData.reduce((acc, cat) => {
          acc[cat.name] = cat;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    const result = activitiesData.map((activity: any) => ({
      ...activity,
      categories: activity.category && categoriesMap[activity.category]
        ? [categoriesMap[activity.category]]
        : [],
      activity_schedules: Array.isArray(activity.activity_schedules) ? activity.activity_schedules : [],
      reviews: Array.isArray(activity.reviews) ? activity.reviews : [],
    }));
    // ...existing code...
    return result;
  },
  async getActivitiesForHomepage(): Promise<ActivityForHomepage[]> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return [];
    }
    
    // Get activities with their basic info
    const { data: activitiesData, error } = await supabase
      .from("activities")
      .select(`
        id, 
        title, 
        final_price,
        b_price, 
        image_url, 
        address,
        average_rating,
        review_count,
        currency_code,
        category
      `)
      .eq("is_active", true)
      .eq("status", 1)
      .limit(20);

    if (error) {
      console.error("Error fetching activities for homepage:", error);
      throw error;
    }

    if (!activitiesData || activitiesData.length === 0) {
      return [];
    }

    // Get activity IDs to fetch their categories from junction table
    const activityIds = activitiesData.map(activity => activity.id);

    // Fetch category relationships from junction table
    const { data: activityCategoriesData, error: categoriesError } = await supabase
      .from("activity_categories")
      .select(`
        activity_id,
        category_id,
        categories (
          id,
          name,
          description
        )
      `)
      .in("activity_id", activityIds);

    if (categoriesError) {
      console.error("Error fetching activity categories:", categoriesError);
    }

    // Group categories by activity ID
    const activityCategoriesMap: Record<number, any[]> = {};
    if (activityCategoriesData) {
      activityCategoriesData.forEach(item => {
        if (!activityCategoriesMap[item.activity_id]) {
          activityCategoriesMap[item.activity_id] = [];
        }
        if (item.categories) {
          activityCategoriesMap[item.activity_id].push(item.categories);
        }
      });
    }

    // Fallback: Get unique category names from the single category field for activities without junction table entries
    const categoryNames = Array.from(new Set(activitiesData.map(activity => activity.category).filter(Boolean)));
    
    let categoriesMap: Record<string, any> = {};
    
    if (categoryNames.length > 0) {
      const { data: categoriesData, error: categoriesError2 } = await supabase
        .from("categories")
        .select("*")
        .in("name", categoryNames);
      
      if (!categoriesError2 && categoriesData) {
        categoriesMap = categoriesData.reduce((acc, cat) => {
          acc[cat.name] = cat;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    return activitiesData.map((activity) => {
      // Get categories from junction table first
      const activityCategories = activityCategoriesMap[activity.id] || [];
      
      // If no categories from junction table, fall back to single category field
      if (activityCategories.length === 0 && activity.category && categoriesMap[activity.category]) {
        activityCategories.push(categoriesMap[activity.category]);
      }
      
      const primaryCategory = activityCategories[0] || null;
      
      return {
        ...activity,
        slug: `activity-${activity.id}`,
        // Use primary category for backward compatibility
        category_name: primaryCategory ? primaryCategory.name : (activity.category || null),
        category_details: primaryCategory || null,
        // Include all categories for the activity
        categories: activityCategories,
        location: activity.address || "Location not specified",
        currency: activity.currency_code || "THB",
      };
    });
  },

  async getActivities(): Promise<ActivityWithDetails[]> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return [];
    }
    
    // Get activities with their related data
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        activity_schedules(*),
        reviews(*, customers(full_name))
      `)
      .eq("is_active", true);

    if (error) {
      console.error(`Error fetching activities:`, error);
      return [];
    }
    if (!data) {
        return [];
    }

    // Get unique category names to fetch category details
    const categoryNames = Array.from(new Set(data.map(activity => activity.category).filter(Boolean)));
    
    let categoriesMap: Record<string, any> = {};
    
    if (categoryNames.length > 0) {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .in("name", categoryNames);
      
      if (!categoriesError && categoriesData) {
        categoriesMap = categoriesData.reduce((acc, cat) => {
          acc[cat.name] = cat;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    return data.map((activity: any) => ({
        ...activity,
        categories: activity.category ? categoriesMap[activity.category] || null : null,
        activity_schedules: Array.isArray(activity.activity_schedules) ? activity.activity_schedules : [],
        reviews: Array.isArray(activity.reviews) ? activity.reviews : [],
    })) as ActivityWithDetails[];
  },

  async getActivityBySlug(slug: string): Promise<ActivityWithDetails | null> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return null;
    }
    
    console.log(`Attempting to fetch activity with slug: ${slug}`);
    
    // Extract ID from slug (format: activity-{id})
    const idMatch = slug.match(/activity-(\d+)/);
    if (!idMatch) {
      console.error(`Invalid slug format: ${slug}. Expected format: activity-{id}`);
      return null;
    }
    
    const activityId = parseInt(idMatch[1], 10);
    console.log(`Extracted activity ID: ${activityId}`);
    
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        activity_schedules(*),
        reviews(*, customers(full_name))
      `)
      .eq("id", activityId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error(`Error fetching activity by slug ${slug}:`, error);
      return null;
    }
    if (!data) {
        console.error(`No activity found with ID ${activityId}`);
        return null;
    }

    console.log(`Successfully found activity: ${data.title}`);

    // Get category details if category exists
    let categoryDetails = null;
    if (data.category) {
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("name", data.category)
        .single();
      
      if (!categoryError && categoryData) {
        categoryDetails = categoryData;
      }
    }

    // Fetch activity options
    const { data: selectedOptions, error: optionsError } = await supabase
      .from("activity_selected_options")
      .select("option_id")
      .eq("activity_id", activityId);

    if (optionsError) {
      console.error(`Error fetching activity selected options for activity ${activityId}:`, optionsError);
    }

    // Group options by type
    const optionsByType: Record<string, string[]> = {
      highlights: [],
      included: [],
      not_included: []
    };

    if (selectedOptions && selectedOptions.length > 0) {
      // Get the option IDs
      const optionIds = selectedOptions.map(item => item.option_id).filter(Boolean);
      
      if (optionIds.length > 0) {
        // Fetch the actual options
        const { data: activityOptions, error: activityOptionsError } = await supabase
          .from("activity_options")
          .select("*")
          .in("id", optionIds);

        if (activityOptionsError) {
          console.error(`Error fetching activity options:`, activityOptionsError);
        } else if (activityOptions) {
          activityOptions.forEach(option => {
            const optionAny = option as any; // Cast to bypass TypeScript types
            const type = optionAny.type?.toLowerCase();
            // Map 'highlight' type to 'highlights' for consistency
            const mappedType = type === 'highlight' ? 'highlights' : type;
            
            if (mappedType && optionsByType[mappedType]) {
              const optionText = optionAny.label || `Option ${optionAny.id}`;
              optionsByType[mappedType].push(optionText);
            }
          });
        }
      }
    }

    // Combine database options with existing field values
    const activity: any = data;
    const combinedActivity = {
        ...activity,
        categories: categoryDetails,
        activity_schedules: Array.isArray(activity.activity_schedules) ? activity.activity_schedules : [],
        reviews: Array.isArray(activity.reviews) ? activity.reviews : [],
        // Combine existing field values with database options
        highlights: [
          ...(activity.highlights ? activity.highlights.split('\n').filter(Boolean) : []),
          ...optionsByType.highlights
        ].join('\n') || activity.highlights,
        included: [
          ...(activity.included ? activity.included.split('\n').filter(Boolean) : []),
          ...optionsByType.included
        ].join('\n') || activity.included,
        not_included: [
          ...(activity.not_included ? activity.not_included.split('\n').filter(Boolean) : []),
          ...optionsByType.not_included
        ].join('\n') || activity.not_included,
    };

    return combinedActivity as ActivityWithDetails;
  },

  async getActivityById(id: number): Promise<ActivityWithDetails | null> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return null;
    }
    
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        activity_schedules(*),
        reviews(*, customers(full_name))
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching activity by id ${id}:`, error);
      return null;
    }
    if (!data) {
        return null;
    }

    // Get category details if category exists
    let categoryDetails = null;
    if (data.category) {
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("name", data.category)
        .single();
      
      if (!categoryError && categoryData) {
        categoryDetails = categoryData;
      }
    }

    // Fetch activity options
    const { data: selectedOptions, error: optionsError } = await supabase
      .from("activity_selected_options")
      .select("option_id")
      .eq("activity_id", id);

    if (optionsError) {
      console.error(`Error fetching activity selected options for activity ${id}:`, optionsError);
    }

    // Group options by type
    const optionsByType: Record<string, string[]> = {
      highlights: [],
      included: [],
      not_included: []
    };

    if (selectedOptions && selectedOptions.length > 0) {
      // Get the option IDs
      const optionIds = selectedOptions.map(item => item.option_id).filter(Boolean);
      
      if (optionIds.length > 0) {
        // Fetch the actual options
        const { data: activityOptions, error: activityOptionsError } = await supabase
          .from("activity_options")
          .select("*")
          .in("id", optionIds);

        if (activityOptionsError) {
          console.error(`Error fetching activity options:`, activityOptionsError);
        } else if (activityOptions) {
          activityOptions.forEach(option => {
            const optionAny = option as any; // Cast to bypass TypeScript types
            const type = optionAny.type?.toLowerCase();
            // Map 'highlight' type to 'highlights' for consistency
            const mappedType = type === 'highlight' ? 'highlights' : type;
            
            if (mappedType && optionsByType[mappedType]) {
              const optionText = optionAny.label || `Option ${optionAny.id}`;
              optionsByType[mappedType].push(optionText);
            }
          });
        }
      }
    }

    // Combine database options with existing field values
    const activity: any = data;
    const combinedActivity = {
        ...activity,
        categories: categoryDetails,
        activity_schedules: Array.isArray(activity.activity_schedules) ? activity.activity_schedules : [],
        reviews: Array.isArray(activity.reviews) ? activity.reviews : [],
        // Combine existing field values with database options
        highlights: [
          ...(activity.highlights ? activity.highlights.split('\n').filter(Boolean) : []),
          ...optionsByType.highlights
        ].join('\n') || activity.highlights,
        included: [
          ...(activity.included ? activity.included.split('\n').filter(Boolean) : []),
          ...optionsByType.included
        ].join('\n') || activity.included,
        not_included: [
          ...(activity.not_included ? activity.not_included.split('\n').filter(Boolean) : []),
          ...optionsByType.not_included
        ].join('\n') || activity.not_included,
    };

    return combinedActivity as ActivityWithDetails;
  },

  async getActivitiesByProvider(providerId: string): Promise<any[]> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return [];
    }
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("provider_id", providerId);

    if (error) {
      console.error("Error fetching activities by provider:", error);
      return [];
    }
    return data;
  },

  async createActivity(activityData: any): Promise<any> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const { data, error } = await supabase
      .from("activities")
      .insert([activityData])
      .select()
      .single();

    if (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
    return data;
  },

  async updateActivity(activityId: number, activityData: any): Promise<any> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const { data, error } = await supabase
      .from("activities")
      .update(activityData)
      .eq("id", activityId)
      .select()
      .single();

    if (error) {
      console.error("Error updating activity:", error);
      throw error;
    }
    return data;
  },

  async deleteActivity(activityId: number): Promise<any> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const { data, error } = await supabase
      .from("activities")
      .delete()
      .eq("id", activityId);

    if (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
    return data;
  },

  async getActivitySchedules(activityId: number): Promise<ActivitySchedule[]> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return [];
    }
    const { data, error } = await supabase
      .from("activity_schedules")
      .select("*")
      .eq("activity_id", activityId);

    if (error) {
      console.error("Error fetching activity schedules:", error);
      return [];
    }
    return data;
  },

  async updateActivitySchedules(activityId: number, schedules: Partial<ActivitySchedule>[]): Promise<any> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    // Separate schedules into new and existing
    const newSchedules = schedules.filter((s) => !s.id);
    const existingSchedules = schedules.filter((s) => s.id);

    // Upsert existing schedules
    if (existingSchedules.length > 0) {
      const { error: updateError } = await supabase
        .from("activity_schedules")
        .upsert(existingSchedules as any);
      if (updateError) {
        console.error("Error updating existing schedules:", updateError);
        throw updateError;
      }
    }

    // Insert new schedules
    if (newSchedules.length > 0) {
        const schedulesToInsert = newSchedules.map(s => ({...s, activity_id: activityId, day_of_week: s.day_of_week as number, start_time: s.start_time as string, end_time: s.end_time as string}));
        const { error: insertError } = await supabase
        .from("activity_schedules")
        .insert(schedulesToInsert);
      if (insertError) {
        console.error("Error inserting new schedules:", insertError);
        throw insertError;
      }
    }

    return { success: true };
  },

  async bookActivity(
    bookingData: Partial<Omit<BaseBooking, 'id' | 'created_at' | 'activities' | 'booking_date' | 'platform_fee'>> & {
      // allow extra fields for backward compatibility
      [key: string]: any;
    },
    requires_approval: boolean
  ): Promise<BaseBooking> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    // Set status only if requires_approval is true
    let insertData: any = { ...bookingData };
    if (requires_approval) {
      insertData.status = "pending";
    }
    const { data, error } = await supabase
      .from("bookings")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Error booking activity:", error);
      throw error;
    }
    return data as BaseBooking;
  },

  async fetchActivitiesByOwner(ownerId: string): Promise<ActivityWithDetails[]> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return [];
    }
    
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        activity_schedules(*),
        reviews(*, customers(full_name))
      `)
      .eq("provider_id", ownerId);

    if (error) {
      console.error("Error fetching activities by owner:", error);
      return [];
    }
    if (!data) {
        return [];
    }

    // Get unique category names to fetch category details
    const categoryNames = Array.from(new Set(data.map(activity => activity.category).filter(Boolean)));
    
    let categoriesMap: Record<string, any> = {};
    
    if (categoryNames.length > 0) {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .in("name", categoryNames);
      
      if (!categoriesError && categoriesData) {
        categoriesMap = categoriesData.reduce((acc, cat) => {
          acc[cat.name] = cat;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    return data.map((activity: any) => ({
        ...activity,
        categories: activity.category ? categoriesMap[activity.category] || null : null,
        activity_schedules: Array.isArray(activity.activity_schedules) ? activity.activity_schedules : [],
        reviews: Array.isArray(activity.reviews) ? activity.reviews : [],
    })) as ActivityWithDetails[];
  },
};

export default activityService;
