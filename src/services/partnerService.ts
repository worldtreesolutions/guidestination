import { supabase } from "@/integrations/supabase/client"

export interface PartnerRegistration {
  id?: string
  user_id?: string
  business_name: string
  owner_name: string
  email: string
  phone: string
  address: string
  latitude?: number
  longitude?: number
  place_id?: string
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
  activity_id: number // Changed from string to number
  commission_rate?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export const partnerService = {
  async createPartnerRegistration(data: Omit<PartnerRegistration, "id" | "created_at" | "updated_at" | "created_by" | "updated_by" | "user_id">) {
    let newUserId: string | undefined = undefined;
    
    try {
      // Check if user already exists with this email
      const { data: existingUser } = await supabase
        .from("partner_registrations")
        .select("email")
        .eq("email", data.email)
        .single()

      if (existingUser) {
        throw new Error("User already registered with this email address")
      }

      // Step 1: Create user in auth.users table with email verification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: Math.random().toString(36).substring(2, 15) + "A1!", // Generate secure temporary password
        options: {
          data: {
            full_name: data.owner_name,
            role: 'partner',
            business_name: data.business_name
          },
          emailRedirectTo: `https://3000-e31f2767-d3ac-4cb2-9894-aa7d0ebe87d2.h1092.daytona.work/partner/verify-email`
        }
      })

      if (authError) {
        console.error("Auth error:", authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }
      
      if (!authData.user) {
        throw new Error("Failed to create user account")
      }

      newUserId = authData.user.id;

      // Step 2: Create partner registration record with user_id as foreign key
      const { data: partnerData, error: partnerError } = await supabase
        .from("partner_registrations")
        .insert([{
          user_id: authData.user.id,
          business_name: data.business_name,
          owner_name: data.owner_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          place_id: data.place_id,
          commission_package: data.commission_package,
          supporting_documents: data.supporting_documents || [],
          status: 'pending'
        }])
        .select()

      if (partnerError) {
        console.error("Partner registration error:", partnerError)
        throw new Error(`Registration error: ${partnerError.message}`)
      }

      return {
        user: authData.user,
        partner: partnerData[0],
        message: 'Registration successful! Please check your email to verify your account before you can access your partner dashboard.'
      }
    } catch (error) {
      // Rollback: Delete user from auth.users if partner registration failed
      if (newUserId) {
        try {
          await fetch('/api/auth/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: newUserId }),
          });
        } catch (rollbackError) {
          console.error("CRITICAL: User rollback failed.", rollbackError);
        }
      }
      
      console.error('Error in partner registration:', error)
      throw error
    }
  },

  async linkPartnerToActivity(partnerId: string, activityId: number, commissionRate: number = 0.05) {
    const { data, error } = await supabase
      .from("establishment_activities")
      .insert([{
        establishment_id: partnerId, // Using establishment_id instead of partner_id
        activity_id: activityId,
        commission_rate: commissionRate,
        is_active: true
      }])
      .select()

    if (error) throw error
    return data[0]
  },

  async unlinkPartnerFromActivity(partnerId: string, activityId: number) {
    const { error } = await supabase
      .from("establishment_activities")
      .delete()
      .eq('establishment_id', partnerId)
      .eq('activity_id', activityId)

    if (error) throw error
    return true
  },

  async getPartnerActivities(partnerId: string) {
    const { data, error } = await supabase
      .from("establishment_activities")
      .select(`
        *,
        activities (
          id,
          title,
          description,
          final_price,
          category_id,
          is_active
        )
      `)
      .eq('establishment_id', partnerId)
      .eq('is_active', true)

    if (error) throw error
    return data
  },

  async getActivityPartners(activityId: number) {
    const { data, error } = await supabase
      .from("establishment_activities")
      .select(`
        *,
        establishments (
          id,
          establishment_name,
          establishment_type,
          establishment_address,
          room_count,
          partner_id,
          partner_registrations (
            id,
            business_name,
            email,
            phone,
            commission_package,
            status
          )
        )
      `)
      .eq('activity_id', activityId)
      .eq('is_active', true)

    if (error) throw error
    return data
  },

  async uploadSupportingDocument(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
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
  },

  async bulkLinkPartnerToActivities(partnerId: string, activityIds: number[], commissionRate: number = 0.05) {
    const insertData = activityIds.map(activityId => ({
      establishment_id: partnerId, // Using establishment_id instead of partner_id
      activity_id: activityId,
      commission_rate: commissionRate,
      is_active: true
    }))

    const { data, error } = await supabase
      .from("establishment_activities")
      .insert(insertData)
      .select()

    if (error) throw error
    return data
  },

  async getAvailableActivities() {
    const { data, error } = await supabase
      .from("activities")
      .select("id, title, description, final_price, category_id")
      .eq("is_active", true)
      .order("title")

    if (error) throw error
    return data
  }
}

export default partnerService
