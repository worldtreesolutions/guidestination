
import { supabase } from "@/integrations/supabase/client"

export interface PartnerRegistration {
  id?: string
  user_id?: string
  business_name: string
  business_type: string
  hotel_license_number: string
  tourism_license_number: string
  owner_name: string
  email: string
  phone: string
  address: string
  latitude?: number
  longitude?: number
  place_id?: string
  room_count: number
  tax_id: string
  commission_package: "basic" | "premium"
  supporting_documents?: string[]
  status?: "pending" | "approved" | "rejected"
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
}

export interface PartnerActivity {
  id?: string
  partner_id: string
  activity_id: string
  commission_rate?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export const partnerService = {
  async createPartnerRegistration(data: Omit<PartnerRegistration, "id" | "created_at" | "updated_at" | "created_by" | "updated_by" | "user_id">) {
    try {
      // Step 1: Create user in auth.users table
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: Math.random().toString(36).substring(2, 15), // Generate temporary password
        options: {
          data: {
            full_name: data.owner_name,
            role: 'partner',
            business_name: data.business_name
          },
          emailRedirectTo: `${window.location.origin}/partner/verify-email`
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user account')

      // Step 2: Create partner registration record with user_id as foreign key
      const { data: partnerData, error: partnerError } = await supabase
        .from("partner_registrations")
        .insert([{
          user_id: authData.user.id,
          business_name: data.business_name,
          business_type: data.business_type,
          hotel_license_number: data.hotel_license_number,
          tourism_license_number: data.tourism_license_number,
          owner_name: data.owner_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          place_id: data.place_id,
          room_count: data.room_count,
          tax_id: data.tax_id,
          commission_package: data.commission_package,
          supporting_documents: data.supporting_documents || [],
          status: 'pending'
        }])
        .select()

      if (partnerError) {
        // If partner registration fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw partnerError
      }

      return {
        user: authData.user,
        partner: partnerData[0],
        message: 'Registration successful! Please check your email to verify your account.'
      }
    } catch (error) {
      console.error('Error in partner registration:', error)
      throw error
    }
  },

  async linkPartnerToActivity(partnerId: string, activityId: string, commissionRate: number = 0.05) {
    const { data, error } = await supabase
      .from("partner_activities")
      .insert([{
        partner_id: partnerId,
        activity_id: activityId,
        commission_rate: commissionRate,
        is_active: true
      }])
      .select()

    if (error) throw error
    return data[0]
  },

  async unlinkPartnerFromActivity(partnerId: string, activityId: string) {
    const { error } = await supabase
      .from("partner_activities")
      .delete()
      .eq('partner_id', partnerId)
      .eq('activity_id', activityId)

    if (error) throw error
    return true
  },

  async getPartnerActivities(partnerId: string) {
    const { data, error } = await supabase
      .from("partner_activities")
      .select(`
        *,
        activities (
          id,
          title,
          description,
          price_per_person,
          category,
          status
        )
      `)
      .eq('partner_id', partnerId)
      .eq('is_active', true)

    if (error) throw error
    return data
  },

  async getActivityPartners(activityId: string) {
    const { data, error } = await supabase
      .from("partner_activities")
      .select(`
        *,
        partner_registrations (
          id,
          business_name,
          business_type,
          email,
          phone,
          commission_package,
          status
        )
      `)
      .eq('activity_id', activityId)
      .eq('is_active', true)

    if (error) throw error
    return data
  },

  async uploadSupportingDocument(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `partner-documents/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from("uploads")
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  async getPartnerRegistrations() {
    const { data, error } = await supabase
      .from("partner_registrations")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async getPartnerRegistrationByEmail(email: string) {
    const { data, error } = await supabase
      .from("partner_registrations")
      .select("*")
      .eq("email", email)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  async getPartnerRegistrationByUserId(userId: string) {
    const { data, error } = await supabase
      .from("partner_registrations")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  async updatePartnerStatus(partnerId: string, status: "pending" | "approved" | "rejected", updatedBy: string) {
    const { data, error } = await supabase
      .from("partner_registrations")
      .update({ 
        status, 
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq("id", partnerId)
      .select()

    if (error) throw error
    return data[0]
  }
}

export default partnerService
