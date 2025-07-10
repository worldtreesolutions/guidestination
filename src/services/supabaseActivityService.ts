
import { supabase } from "@/integrations/supabase/client"
import { SupabaseActivity } from "@/types/activity"

export interface ActivityScheduleInstance {
  id: number
  scheduled_date: string
  start_time: string
  end_time: string
  capacity: number
  booked_count: number
  available_spots: number
  price: number
  status: string
  is_active: boolean
}

export interface ActivitySelectedOption {
  id: string
  option_name: string
  option_type: 'highlight' | 'included' | 'not_included' | 'not_allowed'
  is_selected: boolean
}

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
        .from('activities')
        .select(`
          *,
          categories!inner(name),
          activity_media(media_url, media_type, thumbnail_url)
        `)
        .eq('is_active', true)

      if (filters?.category) {
        query = query.eq('categories.name', filters.category)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching activities:', error)
        throw error
      }

      return data?.map(activity => ({
        ...activity,
        category_name: activity.categories?.name || 'Uncategorized',
        image_urls: activity.activity_media?.map((media: any) => media.media_url) || [],
        price: activity.final_price || activity.b_price || 0,
        rating: activity.average_rating || 0,
        review_count: activity.review_count || 0,
        location: activity.address || 'Location TBD'
      })) || []
    } catch (error) {
      console.error('Error in getActivities:', error)
      throw error
    }
  },

  async getActivityById(id: number): Promise<SupabaseActivity | null> {
    try {
      console.log('Fetching activity with ID:', id)
      
      // Fetch main activity data
      const { data: activity, error: activityError } = await supabase
        .from('activities')
        .select(`
          *,
          categories(name),
          activity_media(media_url, media_type, thumbnail_url)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (activityError) {
        console.error('Error fetching activity:', activityError)
        throw activityError
      }

      if (!activity) {
        return null
      }

      // Fetch schedule instances
      const { data: scheduleInstances, error: scheduleError } = await supabase
        .from('activity_schedule_instances')
        .select('*')
        .eq('activity_id', id)
        .eq('is_active', true)
        .eq('status', 'active')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })

      if (scheduleError) {
        console.error('Error fetching schedule instances:', scheduleError)
      }

      console.log('Raw schedule instances from DB:', scheduleInstances)

      // Fetch activity selected options with option details
      const { data: selectedOptions, error: optionsError } = await supabase
        .from('activity_selected_options')
        .select(`
          id,
          activity_options(
            id,
            label,
            type,
            icon,
            category
          )
        `)
        .eq('activity_id', id)

      if (optionsError) {
        console.error('Error fetching activity options:', optionsError)
      }

      console.log('Raw selected options from DB:', selectedOptions)

      // Format schedule data for the calendar
      const formattedSchedules = scheduleInstances?.map(instance => ({
        date: instance.scheduled_date,
        startTime: instance.start_time,
        endTime: instance.end_time,
        capacity: instance.capacity,
        booked: instance.booked_count,
        available: instance.available_spots,
        price: instance.price
      })) || []

      console.log('Formatted schedules:', formattedSchedules)

      // Format selected options
      const formattedOptions = selectedOptions?.map(option => ({
        id: option.id,
        option_name: option.activity_options?.label || '',
        option_type: option.activity_options?.type || 'included',
        is_selected: true // All records in this table are selected
      })) || []

      console.log('Formatted options:', formattedOptions)

      // Build the complete activity object
      const result: SupabaseActivity = {
        ...activity,
        category_name: activity.categories?.name || 'Uncategorized',
        image_urls: activity.activity_media?.map((media: any) => media.media_url) || [],
        price: activity.final_price || activity.b_price || 0,
        rating: activity.average_rating || 0,
        review_count: activity.review_count || 0,
        location: activity.address || 'Location TBD',
        schedules: {
          availableDates: formattedSchedules
        },
        activity_selected_options: formattedOptions
      }

      console.log('Final activity result:', result)
      console.log('Schedule data being returned:', result.schedules)
      console.log('Available dates array:', result.schedules?.availableDates)

      return result
    } catch (error) {
      console.error('Error in getActivityById:', error)
      throw error
    }
  },

  async createActivity(activityData: Partial<SupabaseActivity>) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([activityData])
        .select()
        .single()

      if (error) {
        console.error('Error creating activity:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createActivity:', error)
      throw error
    }
  },

  async updateActivity(id: number, activityData: Partial<SupabaseActivity>) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update(activityData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating activity:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateActivity:', error)
      throw error
    }
  },

  async deleteActivity(id: number) {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Error deleting activity:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error in deleteActivity:', error)
      throw error
    }
  },

  async getActivitiesByProvider(providerId: string) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          categories(name),
          activity_media(media_url, media_type, thumbnail_url)
        `)
        .eq('provider_id', providerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching provider activities:', error)
        throw error
      }

      return data?.map(activity => ({
        ...activity,
        category_name: activity.categories?.name || 'Uncategorized',
        image_urls: activity.activity_media?.map((media: any) => media.media_url) || [],
        price: activity.final_price || activity.b_price || 0,
        rating: activity.average_rating || 0,
        review_count: activity.review_count || 0,
        location: activity.address || 'Location TBD'
      })) || []
    } catch (error) {
      console.error('Error in getActivitiesByProvider:', error)
      throw error
    }
  },

  async searchActivities(searchTerm: string, filters?: {
    category?: string
    location?: string
    priceRange?: [number, number]
  }) {
    try {
      let query = supabase
        .from('activities')
        .select(`
          *,
          categories(name),
          activity_media(media_url, media_type, thumbnail_url)
        `)
        .eq('is_active', true)

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      if (filters?.category) {
        query = query.eq('categories.name', filters.category)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error searching activities:', error)
        throw error
      }

      return data?.map(activity => ({
        ...activity,
        category_name: activity.categories?.name || 'Uncategorized',
        image_urls: activity.activity_media?.map((media: any) => media.media_url) || [],
        price: activity.final_price || activity.b_price || 0,
        rating: activity.average_rating || 0,
        review_count: activity.review_count || 0,
        location: activity.address || 'Location TBD'
      })) || []
    } catch (error) {
      console.error('Error in searchActivities:', error)
      throw error
    }
  },

  async getActivityCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getActivityCategories:', error)
      throw error
    }
  },

  async uploadActivityMedia(activityId: number, files: File[]) {
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${activityId}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('activity-media')
          .upload(fileName, file)

        if (uploadError) {
          throw uploadError
        }

        const { data: urlData } = supabase.storage
          .from('activity-media')
          .getPublicUrl(fileName)

        // Save media record to database
        const { data: mediaData, error: mediaError } = await supabase
          .from('activity_media')
          .insert([{
            activity_id: activityId,
            media_url: urlData.publicUrl,
            media_type: file.type.startsWith('image/') ? 'image' : 'video',
            file_size: file.size
          }])
          .select()
          .single()

        if (mediaError) {
          throw mediaError
        }

        return mediaData
      })

      const results = await Promise.all(uploadPromises)
      return results
    } catch (error) {
      console.error('Error uploading activity media:', error)
      throw error
    }
  },

  async getActivityReviews(activityId: number) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          customer_profiles(full_name, first_name, last_name)
        `)
        .eq('activity_id', activityId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reviews:', error)
        throw error
      }

      return data?.map(review => ({
        ...review,
        customer_name: review.customer_profiles?.full_name || 
                     `${review.customer_profiles?.first_name || ''} ${review.customer_profiles?.last_name || ''}`.trim() ||
                     'Anonymous'
      })) || []
    } catch (error) {
      console.error('Error in getActivityReviews:', error)
      throw error
    }
  },

  async createActivityReview(reviewData: {
    activity_id: number
    customer_id: string
    rating: number
    comment?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single()

      if (error) {
        console.error('Error creating review:', error)
        throw error
      }

      // Update activity average rating
      await this.updateActivityRating(reviewData.activity_id)

      return data
    } catch (error) {
      console.error('Error in createActivityReview:', error)
      throw error
    }
  },

  async updateActivityRating(activityId: number) {
    try {
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('activity_id', activityId)
        .eq('is_active', true)

      if (reviewsError) {
        throw reviewsError
      }

      if (reviews && reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
        const averageRating = totalRating / reviews.length
        const reviewCount = reviews.length

        const { error: updateError } = await supabase
          .from('activities')
          .update({
            average_rating: averageRating,
            review_count: reviewCount
          })
          .eq('id', activityId)

        if (updateError) {
          throw updateError
        }
      }
    } catch (error) {
      console.error('Error updating activity rating:', error)
      throw error
    }
  }
}

export default supabaseActivityService
