
import { supabase } from "@/integrations/supabase/client"
import type { Database, Tables } from "@/integrations/supabase/types"

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
  activity_id: number
  commission_rate?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// Rate limiting helper
const isRateLimitError = (error: any): boolean => {
  return error?.message?.includes("For security purposes, you can only request this after") ||
         error?.status === 429 ||
         error?.code === 429
}

// Extract wait time from rate limit error message
const extractWaitTime = (errorMessage: string): number => {
  const match = errorMessage.match(/after (\d+) seconds/)
  return match ? parseInt(match[1]) : 60
}

export const partnerService = {
  async createPartnerRegistration(data: Omit<PartnerRegistration, "id" | "created_at" | "updated_at" | "created_by" | "updated_by" | "user_id">) {
    let newUserId: string | undefined = undefined;
    
    try {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      // Check if user already exists with this email (this should work now with RLS policies)
      const { data: existingUser, error: checkError } = await supabase
        .from("partner_registrations")
        .select("email")
        .eq("email", data.email)
        .maybeSingle()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking existing user:", checkError)
        throw new Error("Unable to verify email availability. Please try again.")
      }

      if (existingUser) {
        throw new Error("A partner registration already exists with this email address. Please use a different email or contact support if this is your email.")
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
        
        // Handle rate limiting specifically
        if (isRateLimitError(authError)) {
          const waitTime = extractWaitTime(authError.message)
          throw new Error(`Too many registration attempts. Please wait ${waitTime} seconds before trying again. This security measure helps protect our platform.`)
        }
        
        // Handle other auth errors
        if (authError.message.includes("User already registered")) {
          throw new Error("An account with this email already exists. Please use a different email address.")
        }
        
        throw new Error(`Registration failed: ${authError.message}. Please try again or contact support if the problem persists.`)
      }
      
      if (!authData.user) {
        throw new Error("Failed to create user account. Please try again.")
      }

      newUserId = authData.user.id;

      // Step 2: Create partner registration record with user_id as foreign key
      const { data: partnerRegistrationData, error: partnerError } = await supabase
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
          status: 'pending',
          room_count: 0,
          created_by: authData.user.id
        }])
        .select()

      if (partnerError) {
        console.error("Partner registration error:", partnerError)
        throw new Error(`Registration failed: ${partnerError.message}. Please try again or contact support.`)
      }

      return {
        user: authData.user,
        partner: partnerRegistrationData[0],
        message: 'Registration successful! Please check your email to verify your account before you can access your partner dashboard.'
      }
    } catch (error: any) {
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
      
      // Re-throw the error with user-friendly message
      if (error.message) {
        throw error
      } else {
        throw new Error("Registration failed due to an unexpected error. Please try again later or contact support.")
      }
    }
  },

  async linkPartnerToActivity(partnerId: string, activityId: number, commissionRate: number = 0.05) {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const { data, error } = await supabase
      .from("establishment_activities")
      .insert([{
        establishment_id: partnerId,
        activity_id: activityId,
        commission_rate: commissionRate,
        is_active: true
      }])
      .select()

    if (error) throw error
    return data[0]
  },

  async unlinkPartnerFromActivity(partnerId: string, activityId: number) {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const { error } = await supabase
      .from("establishment_activities")
      .delete()
      .eq('establishment_id', partnerId)
      .eq('activity_id', activityId)

    if (error) throw error
    return true
  },

  async getPartnerActivities(partnerId: string) {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

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
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

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
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

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
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const { data, error } = await supabase
      .from("partner_registrations")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async getPartnerRegistrationByEmail(email: string) {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const { data, error } = await supabase
      .from("partner_registrations")
      .select("*")
      .eq("email", email)
      .maybeSingle()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  async getPartnerRegistrationByUserId(userId: string) {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const { data, error } = await supabase
      .from("partner_registrations")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  async updatePartnerStatus(partnerId: string, status: "pending" | "approved" | "rejected", updatedBy: string) {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

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
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const insertData = activityIds.map(activityId => ({
      establishment_id: partnerId,
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
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const { data, error } = await supabase
      .from("activities")
      .select("id, title, description, final_price, category_id")
      .eq("is_active", true)
      .order("title")

    if (error) throw error
    return data
  },

  async registerPartner(partnerData: {
    user_id?: string;
    business_name: string;
    owner_name: string;
    email: string;
    phone: string;
    address: string;
    latitude?: number;
    longitude?: number;
    place_id?: string;
    room_count?: number;
    commission_package: string;
    supporting_documents?: string[];
  }): Promise<any> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const { data: establishmentData, error: insertError } = await supabase
      .from("establishments")
      .insert({
        establishment_name: partnerData.business_name,
        establishment_type: "partner",
        establishment_address: partnerData.address,
        partner_id: partnerData.user_id || "",
        room_count: partnerData.room_count || 0,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating partner:", insertError);
      throw insertError;
    }

    return establishmentData;
  }
}

export default partnerService
