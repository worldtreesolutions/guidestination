
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Define Activity interface based on the database schema
export interface Activity {
  id?: number;
  provider_id?: number;
  category_id?: number;
  title: string;
  description?: string;
  image_url?: string;
  pickup_location: string;
  dropoff_location: string;
  duration: string; // This is an interval in the DB
  price: number;
  discounts?: number;
  max_participants?: number;
  highlights?: string;
  included?: string;
  not_included?: string;
  meeting_point?: string;
  languages?: string;
  is_active?: boolean;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  b_price?: number;
  status?: number;
}

// Define a type for activity filters
export interface ActivityFilters {
  provider_id?: number;
  category_id?: number;
  is_active?: boolean;
  search?: string;
}

// Define a type for pagination
export interface Pagination {
  page: number;
  limit: number;
}

const activityCrudService = {
  /**
   * Create a new activity
   */
  async createActivity(activity: Activity, user: User): Promise<Activity> {
    // Set created_by and updated_by to the current user's ID
    const userId = user.id;
    
    const { data, error } = await supabase
      .from("activities")
      .insert({
        ...activity,
        created_by: userId,
        updated_by: userId,
        is_active: activity.is_active !== undefined ? activity.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating activity:", error.message);
      throw error;
    }

    return data;
  },

  /**
   * Get all activities with optional filtering and pagination
   */
  async getActivities(
    filters?: ActivityFilters,
    pagination?: Pagination
  ): Promise<{ activities: Activity[]; count: number }> {
    let query = supabase
      .from("activities")
      .select("*", { count: "exact" });

    // Apply filters if provided
    if (filters) {
      if (filters.provider_id !== undefined) {
        query = query.eq("provider_id", filters.provider_id);
      }
      
      if (filters.category_id !== undefined) {
        query = query.eq("category_id", filters.category_id);
      }
      
      if (filters.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
    }

    // Apply pagination if provided
    if (pagination) {
      const { page, limit } = pagination;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.range(from, to);
    }

    // Order by created_at descending (newest first)
    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching activities:", error.message);
      throw error;
    }

    return {
      activities: data || [],
      count: count || 0
    };
  },

  /**
   * Get a single activity by ID
   */
  async getActivityById(id: number): Promise<Activity | null> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // PGRST116 means no rows returned, which is not an error in this context
        return null;
      }
      
      console.error("Error fetching activity:", error.message);
      throw error;
    }

    return data;
  },

  /**
   * Update an existing activity
   */
  async updateActivity(id: number, activity: Partial<Activity>, user: User): Promise<Activity> {
    // Set updated_by to the current user's ID and updated_at to now
    const userId = user.id;
    
    const { data, error } = await supabase
      .from("activities")
      .update({
        ...activity,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating activity:", error.message);
      throw error;
    }

    return data;
  },

  /**
   * Delete an activity (soft delete by setting is_active to false)
   */
  async softDeleteActivity(id: number, user: User): Promise<void> {
    const { error } = await supabase
      .from("activities")
      .update({
        is_active: false,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Error soft deleting activity:", error.message);
      throw error;
    }
  },

  /**
   * Permanently delete an activity
   * Use with caution as this will permanently remove the activity from the database
   */
  async hardDeleteActivity(id: number): Promise<void> {
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error hard deleting activity:", error.message);
      throw error;
    }
  },

  /**
   * Restore a soft-deleted activity
   */
  async restoreActivity(id: number, user: User): Promise<Activity> {
    const { data, error } = await supabase
      .from("activities")
      .update({
        is_active: true,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error restoring activity:", error.message);
      throw error;
    }

    return data;
  },

  /**
   * Get activities by provider ID
   */
  async getActivitiesByProviderId(
    providerId: number,
    pagination?: Pagination
  ): Promise<{ activities: Activity[]; count: number }> {
    return this.getActivities(
      { provider_id: providerId },
      pagination
    );
  },

  /**
   * Get activities by category ID
   */
  async getActivitiesByCategory(
    categoryId: number,
    pagination?: Pagination
  ): Promise<{ activities: Activity[]; count: number }> {
    return this.getActivities(
      { category_id: categoryId },
      pagination
    );
  },

  /**
   * Search activities by title or description
   */
  async searchActivities(
    searchTerm: string,
    pagination?: Pagination
  ): Promise<{ activities: Activity[]; count: number }> {
    return this.getActivities(
      { search: searchTerm },
      pagination
    );
  },

  /**
   * Get active activities
   */
  async getActiveActivities(
    pagination?: Pagination
  ): Promise<{ activities: Activity[]; count: number }> {
    return this.getActivities(
      { is_active: true },
      pagination
    );
  },

  /**
   * Change activity status
   */
  async changeActivityStatus(id: number, status: number, user: User): Promise<Activity> {
    const { data, error } = await supabase
      .from("activities")
      .update({
        status,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error changing activity status:", error.message);
      throw error;
    }

    return data;
  },

  /**
   * Update activity image
   */
  async updateActivityImage(id: number, imageUrl: string, user: User): Promise<Activity> {
    const { data, error } = await supabase
      .from("activities")
      .update({
        image_url: imageUrl,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating activity image:", error.message);
      throw error;
    }

    return data;
  },

  /**
   * Bulk update activities
   */
  async bulkUpdateActivities(
    activityIds: number[],
    updates: Partial<Activity>,
    user: User
  ): Promise<void> {
    const { error } = await supabase
      .from("activities")
      .update({
        ...updates,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .in("id", activityIds);

    if (error) {
      console.error("Error bulk updating activities:", error.message);
      throw error;
    }
  },

  /**
   * Bulk delete activities (soft delete)
   */
  async bulkSoftDeleteActivities(activityIds: number[], user: User): Promise<void> {
    const { error } = await supabase
      .from("activities")
      .update({
        is_active: false,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .in("id", activityIds);

    if (error) {
      console.error("Error bulk soft deleting activities:", error.message);
      throw error;
    }
  }
};

export default activityCrudService;
