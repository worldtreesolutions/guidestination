
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

// Use the Database type to define our Activity type
export type Activity = Database['public']['Tables']['activities']['Row'];
export type ActivityInsert = Database['public']['Tables']['activities']['Insert'];
export type ActivityUpdate = Database['public']['Tables']['activities']['Update'];

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
    // Convert duration string to proper interval format
    const durationMap: { [key: string]: string } = {
      '1_hour': '1 hour',
      '2_hours': '2 hours',
      'half_day': '4 hours',
      'full_day': '8 hours'
    };

    // Log the incoming activity data for debugging
    console.log('Creating activity with data:', JSON.stringify(activity));
    console.log('Provider ID from activity data:', activity.provider_id);

    // Ensure provider_id is set and is a number
    if (!activity.provider_id && user.app_metadata?.provider_id) {
      activity.provider_id = Number(user.app_metadata.provider_id);
      console.log('Setting provider_id from user metadata:', activity.provider_id);
    }

    // Prepare data, casting user ID for integer columns
    const activityData = {
      ...activity,
      // Map the duration string to the proper interval format
      duration: durationMap[activity.duration] || activity.duration,
      // Explicitly set provider_id to ensure it's included
      provider_id: activity.provider_id ? Number(activity.provider_id) : null,
      created_by: null, // Don't use user.id directly for integer columns
      updated_by: null, // Don't use user.id directly for integer columns
      is_active: activity.is_active !== undefined ? activity.is_active : true,
    };

    console.log('Final activity data being inserted:', JSON.stringify(activityData));

    const { data, error } = await supabase
      .from('activities')
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

    return data as Activity;
  },

  /**
   * Get all activities with optional filtering and pagination
   */
  async getActivities(
    filters?: ActivityFilters,
    pagination?: Pagination
  ): Promise<{ activities: Activity[]; count: number }> {
    let query = supabase
      .from('activities')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters) {
      if (filters.provider_id !== undefined) {
        query = query.eq('provider_id', filters.provider_id);
      }
      if (filters.category_id !== undefined) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
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
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching activities:", error.message);
      throw error;
    }

    return {
      activities: (data || []) as Activity[],
      count: count || 0
    };
  },

  /**
   * Get a single activity by ID
   */
  async getActivityById(id: number): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === "PGRST116") { // Not found is not an error here
        return null;
      }
      console.error("Error fetching activity by ID:", error.message);
      throw error;
    }

    return data as Activity | null;
  },

  /**
   * Update an existing activity
   */
  async updateActivity(id: number, activityUpdates: ActivityUpdate, user: User): Promise<Activity> {
    // Convert duration string to proper interval format if it exists in the updates
    const durationMap: { [key: string]: string } = {
      '1_hour': '1 hour',
      '2_hours': '2 hours',
      'half_day': '4 hours',
      'full_day': '8 hours'
    };

    // Prepare update data
    const updateData = {
      ...activityUpdates,
      // Map the duration string to the proper interval format if it exists
      duration: activityUpdates.duration ? (durationMap[activityUpdates.duration] || activityUpdates.duration) : undefined,
      updated_by: null, // Don't use user.id directly for integer columns
      updated_at: new Date().toISOString()
    };

    // Remove fields that cannot be updated directly
    delete (updateData as any).id;
    delete (updateData as any).created_at;
    delete (updateData as any).created_by;
    
    // Remove fields that don't exist in the database schema
    delete (updateData as any).has_pickup;
    delete (updateData as any).image_urls;
    delete (updateData as any).schedule_start_time;
    delete (updateData as any).schedule_end_time;
    delete (updateData as any).schedule_capacity;
    delete (updateData as any).schedule_availability_start_date;
    delete (updateData as any).schedule_availability_end_date;
    delete (updateData as any).schedule_id;

    console.log('Updating activity with data:', JSON.stringify(updateData));

    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating activity:", error.message);
      throw error;
    }

    if (!data) {
      throw new Error("Activity update succeeded but no data returned.");
    }

    return data as Activity;
  },

  /**
   * Delete an activity (soft delete by setting is_active to false)
   */
  async softDeleteActivity(id: number, user: User): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .update({
        is_active: false,
        // Don't use user.id directly for integer columns
        updated_by: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

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
      .from('activities')
      .delete()
      .eq('id', id);

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
      .from('activities')
      .update({
        is_active: true,
        // Don't use user.id directly for integer columns
        updated_by: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error restoring activity:", error.message);
      throw error;
    }

     if (!data) {
      throw new Error("Activity restoration succeeded but no data returned.");
    }

    return data as Activity;
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
    return this.updateActivity(id, { status: status }, user);
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
    const updateData = {
        ...updates,
        // Don't use user.id directly for integer columns
        updated_by: null,
        updated_at: new Date().toISOString()
    };
    delete (updateData as any).id;
    delete (updateData as any).created_at;
    delete (updateData as any).created_by;

    const { error } = await supabase
      .from('activities')
      .update(updateData)
      .in('id', activityIds);

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
      .from('activities')
      .update({
        is_active: false,
        // Don't use user.id directly for integer columns
        updated_by: null,
        updated_at: new Date().toISOString()
      })
      .in('id', activityIds);

    if (error) {
      console.error("Error bulk soft deleting activities:", error.message);
      throw error;
    }
  }
};

export default activityCrudService;
