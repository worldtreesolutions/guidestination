import { supabase } from "@/integrations/supabase/client"
import { SupabaseActivity, ActivityForHomepage, SupabaseBooking, Earning, Booking } from "@/types/activity"

export const supabaseActivityService = {
  baseActivitySelect: `
    *,
    activity_media(media_url, media_type, thumbnail_url)
  `,

  async getFeaturedActivities(limit: number = 4): Promise<SupabaseActivity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(this.baseActivitySelect)
        .eq("is_active", true)
        .order("average_rating", { ascending: false, nullsFirst: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching featured activities:", error)
        throw error
      }

      return data.map((item: any) => this.transformActivity(item))
    } catch (error) {
      console.error("Error fetching featured activities:", error)
      throw error
    }
  },

  async getRecommendedActivities(limit = 8): Promise<SupabaseActivity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(this.baseActivitySelect)
        .eq("is_active", true)
        .order("average_rating", { ascending: false, nullsFirst: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching recommended activities:", error)
        throw error
      }

      return data.map((item: any) => this.transformActivity(item))
    } catch (error) {
      console.error("Error fetching recommended activities:", error)
      throw error
    }
  },

  async getActivitiesByCategory(categoryName: string, limit = 8): Promise<SupabaseActivity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(this.baseActivitySelect)
        .eq("is_active", true)
        .eq("category", categoryName)
        .limit(limit)

      if (error) {
        console.error("Error fetching activities by category:", error)
        throw error
      }

      return data.map((item: any) => this.transformActivity(item))
    } catch (error) {
      console.error("Error fetching activities by category:", error)
      throw error
    }
  },

  async getActivityById(id: number): Promise<SupabaseActivity> {
    try {
      console.log("Fetching activity with ID:", id)
      
      // First, try a simple query to see if the activity exists
      const { data: basicData, error: basicError } = await supabase
        .from("activities")
        .select("*")
        .eq("id", id)
        .single()

      if (basicError) {
        console.error("Basic query error:", basicError)
        throw new Error(`Activity not found: ${basicError.message}`)
      }

      if (!basicData) {
        console.error("No activity found with ID:", id)
        throw new Error("Activity not found")
      }

      console.log("Basic activity data found:", basicData)

      // Now try the complex query with joins
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          activity_media(media_url, media_type, thumbnail_url),
          activity_schedules(
            id,
            capacity,
            booked_count,
            availability_start_date,
            availability_end_date,
            start_time,
            end_time,
            is_active,
            recurrence_pattern,
            recurrence_interval,
            days_of_week
          ),
          activity_schedule_instances(
            id,
            scheduled_date,
            start_time,
            end_time,
            capacity,
            booked_count,
            available_spots,
            price,
            is_active,
            status
          ),
          activity_selected_options(
            id,
            option_id,
            activity_options(
              id,
              label,
              icon,
              type,
              category
            )
          )
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Complex query error:", error)
        // Fall back to basic data if complex query fails
        console.log("Falling back to basic data due to complex query error")
        const transformedActivity = this.transformActivity(basicData)
        return transformedActivity
      }

      if (!data) {
        console.error("No data returned from complex query")
        // Fall back to basic data
        const transformedActivity = this.transformActivity(basicData)
        return transformedActivity
      }

      console.log("Complex query successful, raw activity data:", data)
      const transformedActivity = this.transformActivity(data)
      console.log("Transformed activity:", transformedActivity)
      
      return transformedActivity
    } catch (error) {
      console.error("Error fetching activity by ID:", error)
      throw error
    }
  },

  async getAllActivities(limit?: number): Promise<SupabaseActivity[]> {
    try {
      let query = supabase
        .from("activities")
        .select(this.baseActivitySelect)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching all activities:", error)
        throw error
      }

      return data.map(this.transformActivity.bind(this))
    } catch (error) {
      console.error("Error fetching all activities:", error)
      throw error
    }
  },

  async searchActivities(searchTerm: string, limit: number = 20): Promise<SupabaseActivity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(this.baseActivitySelect)
        .eq("is_active", true)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .limit(limit)

      if (error) {
        console.error("Error searching activities:", error)
        throw error
      }

      return data.map(this.transformActivity.bind(this))
    } catch (error) {
      console.error("Error searching activities:", error)
      throw error
    }
  },

  async fetchActivitiesByOwner(providerId: string): Promise<SupabaseActivity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(this.baseActivitySelect)
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching activities by provider:", error)
        throw error
      }

      return data.map(this.transformActivity.bind(this))
    } catch (error) {
      console.error("Error fetching activities by provider:", error)
      throw error
    }
  },

  async createActivity(activityData: Partial<SupabaseActivity>): Promise<SupabaseActivity> {
    try {
      // Map the activity data to match the database schema
      const insertData: any = {
        title: activityData.title || "",
        description: activityData.description || "",
        category: activityData.category || "",
        base_price_thb: activityData.price || 0,
        max_participants: activityData.max_participants || 10,
        duration: activityData.duration || null,
        min_age: activityData.min_age || null,
        max_age: activityData.max_age || null,
        physical_effort_level: activityData.physical_effort_level || null,
        technical_skill_level: activityData.technical_skill_level || null,
        meeting_point: activityData.meeting_point || "",
        includes_pickup: activityData.includes_pickup || false,
        pickup_locations: activityData.pickup_locations || "",
        includes_meal: activityData.includes_meal || false,
        meal_description: activityData.meal_description || "",
        provider_id: activityData.provider_id || "",
        is_active: activityData.is_active !== undefined ? activityData.is_active : true,
        highlights: activityData.highlights ? JSON.stringify(activityData.highlights) : null,
        included: activityData.included ? JSON.stringify(activityData.included) : null,
        not_included: activityData.not_included ? JSON.stringify(activityData.not_included) : null,
        languages: activityData.languages ? JSON.stringify(activityData.languages) : null,
      }

      const { data, error } = await supabase
        .from("activities")
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error("Error creating activity:", error)
        throw error
      }

      return this.transformActivity(data)
    } catch (error) {
      console.error("Error creating activity:", error)
      throw error
    }
  },

  async updateActivity(id: number, activityData: Partial<SupabaseActivity>): Promise<SupabaseActivity> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (activityData.title) updateData.title = activityData.title
      if (activityData.description) updateData.description = activityData.description
      if (activityData.category) updateData.category = activityData.category
      if (activityData.price) updateData.base_price_thb = activityData.price
      if (activityData.max_participants) updateData.max_participants = activityData.max_participants
      if (activityData.duration) updateData.duration = activityData.duration
      if (activityData.meeting_point) updateData.meeting_point = activityData.meeting_point
      if (activityData.includes_pickup !== undefined) updateData.includes_pickup = activityData.includes_pickup
      if (activityData.pickup_locations) updateData.pickup_locations = activityData.pickup_locations
      if (activityData.includes_meal !== undefined) updateData.includes_meal = activityData.includes_meal
      if (activityData.meal_description) updateData.meal_description = activityData.meal_description
      if (activityData.highlights) updateData.highlights = JSON.stringify(activityData.highlights)
      if (activityData.included) updateData.included = JSON.stringify(activityData.included)
      if (activityData.not_included) updateData.not_included = JSON.stringify(activityData.not_included)
      if (activityData.languages) updateData.languages = JSON.stringify(activityData.languages)

      const { data, error } = await supabase
        .from("activities")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating activity:", error)
        throw error
      }

      return this.transformActivity(data)
    } catch (error) {
      console.error("Error updating activity:", error)
      throw error
    }
  },

  async deleteActivity(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("activities")
        .update({ is_active: false })
        .eq("id", id)

      if (error) {
        console.error("Error deleting activity:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Error deleting activity:", error)
      throw error
    }
  },

  async fetchBookingsForOwner(ownerId: string): Promise<Booking[]> {
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('id')
      .eq('provider_id', ownerId);

    if (activitiesError) {
      console.error('Error fetching activities for owner:', activitiesError);
      throw activitiesError;
    }

    if (!activitiesData) {
      return [];
    }

    const activityIds = activitiesData.map((a: { id: number }) => a.id);

    if (activityIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        activities:activity_id (
          title
        ),
        profiles:user_id (
          full_name,
          email
        )
      `)
      .in('activity_id', activityIds);

    if (error) {
      console.error("Error fetching bookings for owner:", error);
      throw error;
    }

    return data.map((b: any) => ({
      ...b,
      activityTitle: b.activities?.title,
      customerName: b.profiles?.full_name,
      customerEmail: b.profiles?.email,
      date: b.booking_date,
      bookingTime: new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      participants: b.num_participants,
      totalAmount: b.total_price,
      platformFee: b.total_price * 0.1, // Assuming 10% fee
      providerAmount: b.total_price * 0.9,
    })) as Booking[];
  },

  async fetchRecentBookingsForOwner(ownerId: string): Promise<Booking[]> {
    const bookings = await this.fetchBookingsForOwner(ownerId);
    return bookings
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  },

  async fetchEarningsForOwner(ownerId: string): Promise<Earning> {
    const bookings = await this.fetchBookingsForOwner(ownerId);
    
    const total = bookings.reduce((sum, b) => sum + (b.providerAmount || 0), 0);
    const pending = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.providerAmount || 0), 0);

    const monthly: { month: string; amount: number }[] = [];
    bookings.forEach(b => {
      if (!b.created_at) return;
      const month = new Date(b.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      const existing = monthly.find(m => m.month === month);
      if (existing) {
        existing.amount += (b.providerAmount || 0);
      } else {
        monthly.push({ month, amount: (b.providerAmount || 0) });
      }
    });

    return { total, pending, monthly };
  },

  transformActivity(data: any): SupabaseActivity {
    console.log("Transforming activity data:", data)
    
    // Transform schedule instances into the format expected by the calendar
    const scheduleInstances = data.activity_schedule_instances || []
    const availableDates = scheduleInstances
      .filter((instance: any) => instance.is_active && instance.status === 'available')
      .map((instance: any) => ({
        date: instance.scheduled_date,
        startTime: instance.start_time,
        endTime: instance.end_time,
        capacity: instance.capacity || 10,
        booked: instance.booked_count || 0,
        available: instance.available_spots || (instance.capacity - (instance.booked_count || 0)),
        price: instance.price || data.price
      }))

    console.log("Transformed schedule instances:", availableDates)

    // Transform selected options
    const selectedOptions = (data.activity_selected_options || []).map((selectedOption: any) => {
      const option = selectedOption.activity_options
      return {
        id: option?.id,
        label: option?.label || '',
        icon: option?.icon || '',
        type: option?.type || 'highlight',
        category: option?.category || ''
      }
    }).filter((opt: any) => opt.id) // Filter out invalid options

    console.log("Transformed selected options:", selectedOptions)

    return {
      id: data.id,
      title: data.title || data.name || '',
      name: data.name || data.title || '',
      description: data.description || '',
      price: data.price || 0,
      duration: data.duration,
      max_participants: data.max_participants || 10,
      location: data.location || '',
      meeting_point: data.meeting_point || '',
      category: data.category || '',
      category_name: data.category_name || '',
      provider_id: data.provider_id,
      is_active: data.is_active || false,
      created_at: data.created_at,
      updated_at: data.updated_at,
      
      // Age and skill requirements
      min_age: data.min_age,
      max_age: data.max_age,
      physical_effort_level: data.physical_effort_level,
      technical_skill_level: data.technical_skill_level,
      
      // Additional features
      includes_pickup: data.includes_pickup || false,
      includes_meal: data.includes_meal || false,
      pickup_locations: data.pickup_locations,
      meal_description: data.meal_description,
      
      // Media
      image_urls: (data.activity_media || [])
        .filter((media: any) => media.media_type === 'image')
        .map((media: any) => media.media_url),
      video_url: (data.activity_media || [])
        .filter((media: any) => media.media_type === 'video')
        .map((media: any) => media.media_url)?.[0] || null,
      
      // Languages
      languages: data.languages || ['English'],
      
      // Reviews
      rating: data.rating || 0,
      review_count: data.review_count || 0,
      
      // Legacy fields for compatibility
      highlights: data.highlights || [],
      included: data.included || [],
      not_included: data.not_included || [],
      
      // New structured data
      selectedOptions: selectedOptions,
      
      // Schedule data in the format expected by the calendar
      schedules: {
        availableDates: availableDates
      }
    }
  },

  convertToHomepageFormat(activities: SupabaseActivity[]): ActivityForHomepage[] {
    return activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      name: activity.name,
      description: activity.description,
      category: activity.category,
      category_name: activity.category_name,
      price: typeof activity.price === 'number' ? activity.price : 0,
      rating: typeof activity.rating === 'number' ? activity.rating : 0,
      review_count: activity.review_count,
      image_url: activity.image_urls?.[0] || "https://images.unsplash.com/photo-1563492065-1a83e8c6b8d8",
      image_urls: activity.image_urls,
      location: activity.location,
      duration: activity.duration,
      provider_id: activity.provider_id
    }))
  },

  parseJsonField(field: any): any {
    if (!field) return null
    if (typeof field === "string") {
      try {
        return JSON.parse(field)
      } catch {
        return field.split(",").map((item: string) => item.trim()).filter(Boolean)
      }
    }
    return field
  },

  async getActivities(filters: any = {}): Promise<SupabaseActivity[]> {
    try {
      let query = supabase
        .from("activities")
        .select(this.baseActivitySelect)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (filters.category) {
        query = query.eq("category", filters.category)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching activities:", error)
        throw error
      }

      return data.map(this.transformActivity.bind(this))
    } catch (error) {
      console.error("Error fetching activities:", error)
      throw error
    }
  }
}
