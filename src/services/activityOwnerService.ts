import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"

// Define types based on the database table structure
export type ActivityOwner = Database["public"]["Tables"]["activity_owners"]["Row"]
export type ActivityOwnerInsert = Database["public"]["Tables"]["activity_owners"]["Insert"]
export type ActivityOwnerUpdate = Database["public"]["Tables"]["activity_owners"]["Update"]

// Define a specific type for the registration form data, mapping form fields to DB columns
export interface ActivityOwnerRegistration {
  business_name: string
  owner_name: string
  email: string
  phone: string
  business_type: string
  tax_id: string
  address: string
  description: string
  tourism_license_number: string
  tat_license_number?: string | null // Allow null for optional fields
  guide_card_number?: string | null // Allow null for optional fields
  insurance_policy: string
  insurance_amount: string
  // user_id will be handled by Supabase Auth or RLS policies
}

export const activityOwnerService = {
  async registerActivityOwner( ActivityOwnerRegistration) {
    // Map registration data to the insert type, ensuring optional fields are handled
    const insertData: ActivityOwnerInsert = {
      ...data,
      tat_license_number: data.tat_license_number || null,
      guide_card_number: data.guide_card_number || null,
      // Assuming user_id might be set via RLS or session later
      // If user needs to be linked immediately, get user ID from auth context
    }

    const {  result, error } = await supabase
      .from("activity_owners")
      .insert(insertData) // Use the correctly typed insert data
      .select()
      .single() // Expecting a single row back

    if (error) {
      console.error("Supabase insert error:", error)
      throw error
    }
    return result as ActivityOwner // Cast the result to the Row type
  },

  async getActivityOwnerByEmail(email: string): Promise<ActivityOwner | null> {
    const { data, error } = await supabase
      .from("activity_owners")
      .select("*")
      .eq("email", email)
      .maybeSingle() // Use maybeSingle to handle cases where owner might not exist

    if (error) {
      console.error("Supabase select error:", error)
      // Don't throw if it's a 'not found' type error, just return null
      if (error.code === 'PGRST116') { 
        return null
      }
      throw error
    }
    return data // Type is inferred correctly by maybeSingle
  },

  async updateActivityOwner(id: string, updates: ActivityOwnerUpdate): Promise<ActivityOwner> {
     // Ensure updates only contain valid columns for the Update type
    const {  result, error } = await supabase
      .from("activity_owners")
      .update(updates)
      .eq("id", id)
      .select()
      .single() // Expecting a single row back

    if (error) {
      console.error("Supabase update error:", error)
      throw error
    }
    return result as ActivityOwner // Cast the result
  }
}

export default activityOwnerService
