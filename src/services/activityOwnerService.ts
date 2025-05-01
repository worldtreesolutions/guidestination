import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"

// Define types based on the database table structure
// Ensure src/integrations/supabase/types.ts is up-to-date with your DB schema
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
  tat_license_number?: string | null
  guide_card_number?: string | null
  insurance_policy: string
  insurance_amount: string
  // user_id will likely be handled by Supabase Auth RLS policies or session context
}

export const activityOwnerService = {
  // Add explicit type for the 'registrationData' parameter
  async registerActivityOwner(registrationData: ActivityOwnerRegistration): Promise<ActivityOwner> {
    // Map registration data to the insert type, ensuring optional fields are handled
    const insertData: ActivityOwnerInsert = {
      // Reference the 'registrationData' parameter correctly
      business_name: registrationData.business_name,
      owner_name: registrationData.owner_name,
      email: registrationData.email,
      phone: registrationData.phone,
      business_type: registrationData.business_type,
      tax_id: registrationData.tax_id,
      address: registrationData.address,
      description: registrationData.description,
      tourism_license_number: registrationData.tourism_license_number,
      tat_license_number: registrationData.tat_license_number || null,
      guide_card_number: registrationData.guide_card_number || null,
      insurance_policy: registrationData.insurance_policy,
      insurance_amount: registrationData.insurance_amount,
      // user_id is omitted here, assuming it's set by RLS or session context later
    }

    // Use the 'data' property from the response
    const { data, error } = await supabase
      .from("activity_owners")
      .insert(insertData) // Use the correctly typed insert data
      .select()
      .single() // Expecting a single row back

    if (error) {
      console.error("Supabase insert error:", error)
      throw error
    }
    if (!data) {
      throw new Error("Failed to register activity owner: No data returned.")
    }
    // Supabase returns the inserted row in the 'data' property when using .single()
    return data 
  },

  async getActivityOwnerByEmail(email: string): Promise<ActivityOwner | null> {
    const { data, error } = await supabase
      .from("activity_owners")
      .select("*")
      .eq("email", email)
      .maybeSingle() // Use maybeSingle to handle cases where owner might not exist

    if (error) {
      console.error("Supabase select error:", error)
      // PGRST116: 'Requested range not satisfiable' often means no rows found
      if (error.code === 'PGRST116') { 
        return null
      }
      throw error
    }
    return data // Type is inferred correctly by maybeSingle
  },

  async updateActivityOwner(id: string, updates: ActivityOwnerUpdate): Promise<ActivityOwner> {
    // Use the 'data' property from the response
    const { data, error } = await supabase
      .from("activity_owners")
      .update(updates)
      .eq("id", id)
      .select()
      .single() // Expecting a single row back

    if (error) {
      console.error("Supabase update error:", error)
      throw error
    }
     if (!data) {
      throw new Error("Failed to update activity owner: No data returned.")
    }
    // Supabase returns the updated row in the 'data' property when using .single()
    return data 
  }
}

export default activityOwnerService
