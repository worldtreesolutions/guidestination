
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Manual Activity interface (since generated types are incomplete)
export interface Activity {
  id?: number;
  provider_id?: number; // Assuming this links to activity_providers table (integer ID)
  category_id?: number; // Assuming this links to categories table (integer ID)
  title: string;
  description?: string | null;
  image_url?: string | null;
  pickup_location: string;
  dropoff_location: string;
  duration: string; // Interval type represented as string e.g., "04:00:00" for 4 hours
  price: number;
  discounts?: number | null;
  max_participants?: number | null;
  highlights?: string | null;
  included?: string | null;
  not_included?: string | null;
  meeting_point?: string | null;
  languages?: string | null;
  is_active?: boolean | null;
  created_by?: number | null; // Schema has integer, Auth user ID is UUID string
  updated_by?: number | null; // Schema has integer, Auth user ID is UUID string
  created_at?: string | null;
  updated_at?: string | null;
  b_price?: number | null;
  status?: number | null; // Assuming integer status codes
}

// Define ActivityInsert type based on the manual interface (excluding read-only fields)
export type ActivityInsert = Omit<Activity, "id" | "created_at" | "updated_at" | "created_by" | "updated_by"> & {
  created_by?: number | null; // Allow setting explicitly if needed, otherwise handled by service
  updated_by?: number | null;
};

// Define ActivityUpdate type based on the manual interface (all fields optional)
export type ActivityUpdate = Partial<Omit<Activity, "id" | "created_at" | "created_by">> & {
  updated_by?: number | null; // Allow setting explicitly if needed, otherwise handled by service
};


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
  async createActivity(activity: ActivityInsert, user: User): Promise<Activity> {
    const userId = user.id;

    // Prepare data, casting user ID for integer columns
    const activityData = {
      ...activity,
      created_by: userId as any, // Cast UUID to any for integer column
      updated_by: userId as any, // Cast UUID to any for integer column
      is_active: activity.is_active !== undefined ? activity.is_active : true,
      // Let DB handle default timestamps if not provided
    };

    const { data, error } = await supabase
      .from("activities") // Use table name string
      .insert(activityData)
      .select()
      .single();

    if (error) {
      console.error("Error creating activity:", error.message);
      throw error;
    }

    if (!data) {
      throw new Error("Activity creation succeeded but no data returned.");
    }

    return data as Activity; // Assert type due to incomplete generated types
  },

  /**
   * Get all activities with optional filtering and pagination
   */
  async getActivities(
    filters?: ActivityFilters,
    pagination?: Pagination
  ): Promise<{ activities: Activity[]; count: number }> {
    let query = supabase
      .from("activities") // Use table name string
      .select("*", { count: "exact" });

    // Apply filters
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

    // Apply pagination
    if (pagination) {
      const { page, limit } = pagination;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    // Order by creation date
    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching activities:", error.message);
      throw error;
    }

    return {
      activities: (data || []) as Activity[], // Assert type
      count: count || 0
    };
  },

  /**
   * Get a single activity by ID
   */
  async getActivityById(id: number): Promise<Activity | null> {
    const { data, error } = await supabase
      .from("activities") // Use table name string
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") { // Not found is not an error here
        return null;
      }
      console.error("Error fetching activity by ID:", error.message);
      throw error;
    }

    return data as Activity | null; // Assert type
  },

  /**
   * Update an existing activity
   */
  async updateActivity(id: number, activityUpdates: ActivityUpdate, user: User): Promise<Activity> {
    const userId = user.id;

    // Prepare update data
    const updateData = {
      ...activityUpdates,
      updated_by: userId as any, // Cast UUID to any for integer column
      updated_at: new Date().toISOString()
    };

    // Remove id if present in updates, as it shouldn't be updated
    delete (updateData as any).id;
    // Remove created_at/created_by if present
    delete (updateData as any).created_at;
    delete (updateData as any).created_by;


    const { data, error } = await supabase
      .from("activities") // Use table name string
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating activity:", error.message);
      throw error;
    }

    if (!data) {
      throw new Error("Activity update succeeded but no data returned.");
    }

    return data as Activity; // Assert type
  },

  /**
   * Delete an activity (soft delete by setting is_active to false)
   */
  async softDeleteActivity(id: number, user: User): Promise<void> {
    const userId = user.id;
    const { error } = await supabase
      .from("activities") // Use table name string
      .update({
        is_active: false,
        updated_by: userId as any, // Cast UUID to any
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
   */
  async hardDeleteActivity(id: number): Promise<void> {
    const { error } = await supabase
      .from("activities") // Use table name string
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
    const userId = user.id;
    const { data, error } = await supabase
      .from("activities") // Use table name string
      .update({
        is_active: true,
        updated_by: userId as any, // Cast UUID to any
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error restoring activity:", error.message);
      throw error;
    }

     if (!data) {
      throw new Error("Activity restoration succeeded but no data returned.");
    }

    return data as Activity; // Assert type
  },

  // --- Additional Helper Methods ---

  /**
   * Get activities by provider ID
   */
  async getActivitiesByProviderId(
    providerId: number,
    pagination?: Pagination
  ): Promise<{ activities: Activity[]; count: number }> {
    return this.getActivities({ provider_id: providerId }, pagination);
  },

  /**
   * Get activities by category ID
   */
  async getActivitiesByCategory(
    categoryId: number,
    pagination?: Pagination
  ): Promise<{ activities: Activity[]; count: number }> {
    return this.getActivities({ category_id: categoryId }, pagination);
  },

  /**
   * Search activities by title or description
   */
  async searchActivities(
    searchTerm: string,
    pagination?: Pagination
  ): Promise<{ activities: Activity[]; count: number }> {
    return this.getActivities({ search: searchTerm }, pagination);
  },

  /**
   * Get active activities
   */
  async getActiveActivities(
    pagination?: Pagination
  ): Promise<{ activities: Activity[]; count: number }> {
    return this.getActivities({ is_active: true }, pagination);
  },

  /**
   * Change activity status
   */
  async changeActivityStatus(id: number, status: number, user: User): Promise<Activity> {
    return this.updateActivity(id, { status }, user);
  },

  /**
   * Update activity image
   */
  async updateActivityImage(id: number, imageUrl: string, user: User): Promise<Activity> {
     return this.updateActivity(id, { image_url: imageUrl }, user);
  },

  /**
   * Bulk update activities
   */
  async bulkUpdateActivities(
    activityIds: number[],
    updates: ActivityUpdate,
    user: User
  ): Promise<void> {
    const userId = user.id;
    const updateData = {
        ...updates,
        updated_by: userId as any, // Cast UUID to any
        updated_at: new Date().toISOString()
    };
    // Remove fields that shouldn't be bulk updated if present
    delete (updateData as any).id;
    delete (updateData as any).created_at;
    delete (updateData as any).created_by;

    const { error } = await supabase
      .from("activities") // Use table name string
      .update(updateData)
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
    const userId = user.id;
    const { error } = await supabase
      .from("activities") // Use table name string
      .update({
        is_active: false,
        updated_by: userId as any, // Cast UUID to any
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
