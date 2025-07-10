
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
            is_recurring,
            recurrence_day_of_week,
            recurrence_end_date
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
        .maybeSingle()

      if (error) {
        console.error("Error fetching activity by ID:", error)
        throw error
      }

      if (!data) {
        throw new Error(`Activity with ID ${id} not found.`)
      }

      console.log("Complex query successful, raw activity data:", data)
      const transformedActivity = this.transformActivity(data)
      console.log("Transformed activity:", transformedActivity)
      
      return transformedActivity
    } catch (error) {
      console.error("Error in getActivityById:", error)
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

  generateScheduleInstances(schedules: any[], activityPrice: number): any[] {
    const instances: any[] = [];
    const today = new Date();
    const futureLimit = new Date();
    futureLimit.setMonth(futureLimit.getMonth() + 6); // Generate 6 months ahead

    schedules.forEach(schedule => {
      if (!schedule.is_active) return;

      const startDate = schedule.availability_start_date ? new Date(schedule.availability_start_date) : today;
      const endDate = schedule.availability_end_date ? new Date(schedule.availability_end_date) : futureLimit;
      
      if (schedule.is_recurring && schedule.recurrence_pattern === 'weekly' && schedule.recurrence_day_of_week) {
        // Generate weekly recurring instances
        const daysOfWeek = Array.isArray(schedule.recurrence_day_of_week) ? schedule.recurrence_day_of_week : [schedule.recurrence_day_of_week];
        
        let currentDate = new Date(startDate);
        while (currentDate <= endDate && currentDate <= futureLimit) {
          const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
          
          if (daysOfWeek.includes(dayOfWeek)) {
            instances.push({
              id: `generated-${schedule.id}-${currentDate.toISOString().split('T')[0]}`,
              scheduled_date: currentDate.toISOString().split('T')[0],
              start_time: schedule.start_time || '09:00:00',
              end_time: schedule.end_time || '17:00:00',
              capacity: schedule.capacity || 10,
              booked_count: 0,
              available_spots: schedule.capacity || 10,
              price: activityPrice,
              is_active: true,
              status: 'available'
            });
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (schedule.is_recurring && schedule.recurrence_pattern === 'daily') {
        // Generate daily recurring instances
        let currentDate = new Date(startDate);
        const interval = schedule.recurrence_interval || 1;
        
        while (currentDate <= endDate && currentDate <= futureLimit) {
          instances.push({
            id: `generated-${schedule.id}-${currentDate.toISOString().split('T')[0]}`,
            scheduled_date: currentDate.toISOString().split('T')[0],
            start_time: schedule.start_time || '09:00:00',
            end_time: schedule.end_time || '17:00:00',
            capacity: schedule.capacity || 10,
            booked_count: 0,
            available_spots: schedule.capacity || 10,
            price: activityPrice,
            is_active: true,
            status: 'available'
          });
          
          currentDate.setDate(currentDate.getDate() + interval);
        }
      } else {
        // One-time schedule
        if (startDate >= today) {
          instances.push({
            id: `generated-${schedule.id}-${startDate.toISOString().split('T')[0]}`,
            scheduled_date: startDate.toISOString().split('T')[0],
            start_time: schedule.start_time || '09:00:00',
            end_time: schedule.end_time || '17:00:00',
            capacity: schedule.capacity || 10,
            booked_count: 0,
            available_spots: schedule.capacity || 10,
            price: activityPrice,
            is_active: true,
            status: 'available'
          });
        }
      }
    });

    return instances;
  },

  transformActivity(data: any): SupabaseActivity {
    console.log("Transforming activity data:", data);
    
    // Handle schedule instances - combine existing instances with generated ones from schedules
    let scheduleInstances: any[] = data.activity_schedule_instances || [];
    
    // If we have schedules but no instances, generate them
    if (data.activity_schedules && data.activity_schedules.length > 0 && scheduleInstances.length === 0) {
      console.log("Generating schedule instances from schedules:", data.activity_schedules);
      scheduleInstances = this.generateScheduleInstances(data.activity_schedules, data.price || data.base_price_thb || 0);
    }

    const availableDates: SupabaseActivity['schedules']['availableDates'] = scheduleInstances
      .filter((instance: any) => instance.is_active && (instance.status === 'available' || instance.status === 'active'))
      .map((instance: any) => ({
        date: instance.scheduled_date,
        startTime: instance.start_time,
        endTime: instance.end_time,
        capacity: instance.capacity || 10,
        booked: instance.booked_count || 0,
        available: instance.available_spots ?? (instance.capacity - (instance.booked_count || 0)),
        price: instance.price || data.price || data.base_price_thb,
      }));

    console.log("Generated available dates:", availableDates);

    // Handle selected options with proper type categorization
    const selectedOptionsData: any[] = data.activity_selected_options || [];
    console.log("Raw selected options data:", selectedOptionsData);
    
    const selectedOptions: SupabaseActivity['selectedOptions'] = selectedOptionsData
      .map((selectedOption: any) => {
        const option = selectedOption.activity_options;
        if (!option) {
          console.log("No activity_options found for selected option:", selectedOption);
          return null;
        }
        return {
          id: option.id,
          label: option.label || '',
          icon: option.icon || '',
          type: option.type || 'highlight',
          category: option.category || '',
        };
      })
      .filter((opt): opt is NonNullable<typeof opt> => opt !== null && opt.id);

    console.log("Processed selected options:", selectedOptions);

    // Parse languages field to ensure it's always an array
    let languages: string[] = ['English'];
    if (data.languages) {
      if (Array.isArray(data.languages)) {
        languages = data.languages;
      } else if (typeof data.languages === 'string') {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(data.languages);
          languages = Array.isArray(parsed) ? parsed : [data.languages];
        } catch {
          // If JSON parsing fails, treat as comma-separated string
          languages = data.languages.split(',').map((lang: string) => lang.trim()).filter(Boolean);
        }
      }
    }

    // Parse other JSON fields
    const highlights = this.parseJsonField(data.highlights) || [];
    const included = this.parseJsonField(data.included) || [];
    const not_included = this.parseJsonField(data.not_included) || [];

    console.log("Parsed JSON fields:", { highlights, included, not_included });

    const transformed: SupabaseActivity = {
      id: data.id,
      title: data.title || data.name || '',
      name: data.name || data.title || '',
      description: data.description || '',
      price: data.price ?? data.base_price_thb ?? null,
      duration: data.duration,
      max_participants: data.max_participants || 10,
      location: data.location || '',
      meeting_point: data.meeting_point || '',
      category: data.category || '',
      category_name: data.category_name || '',
      provider_id: data.provider_id,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
      min_age: data.min_age,
      max_age: data.max_age,
      physical_effort_level: data.physical_effort_level,
      technical_skill_level: data.technical_skill_level,
      includes_pickup: data.includes_pickup,
      includes_meal: data.includes_meal,
      pickup_locations: data.pickup_locations,
      meal_description: data.meal_description,
      image_urls: (data.activity_media || [])
        .filter((media: any) => media.media_type === 'image')
        .map((media: any) => media.media_url),
      video_url: (data.activity_media || [])
        .find((media: any) => media.media_type === 'video')?.media_url || null,
      languages: languages,
      rating: data.rating ?? data.average_rating ?? null,
      review_count: data.review_count || 0,
      highlights: highlights,
      included: included,
      not_included: not_included,
      selectedOptions: selectedOptions,
      schedules: {
        availableDates: availableDates,
      },
    };
    
    console.log("Final transformed activity:", transformed);
    return transformed;
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
