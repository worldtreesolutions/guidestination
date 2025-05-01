import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"

// Define types based on the database table structure
// Ensure src/integrations/supabase/types.ts is up-to-date with your DB schema
// If you encounter errors like "Property 'activity_owners' does not exist", 
// you might need to regenerate Supabase types.
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
  // user_id will likely be handled by Supabase Auth RLS policies or session context
}

export const activityOwnerService = {
  // Add explicit type for the 'data' parameter
  async registerActivityOwner( ActivityOwnerRegistration): Promise<ActivityOwner> {
    // Map registration data to the insert type, ensuring optional fields are handled
    const insertData: ActivityOwnerInsert = {
      // Reference the 'data' parameter correctly
      business_name: data.business_name,
      owner_name: data.owner_name,
      email: data.email,
      phone: data.phone,
      business_type: data.business_type,
      tax_id: data.tax_id,
      address: data.address,
      description: data.description,
      tourism_license_number: data.tourism_license_number,
      tat_license_number: data.tat_license_number || null,
      guide_card_number: data.guide_card_number || null,
      insurance_policy: data.insurance_policy,
      insurance_amount: data.insurance_amount,
      // user_id is omitted here, assuming it's set by RLS or session context later
      // If you need to set it explicitly, get the user ID from useAuth() and add it here
    }

    // Use 'data' property from the response, not 'result'
    const {  insertedData, error } = await supabase
      .from("activity_owners")
      .insert(insertData) // Use the correctly typed insert data
      .select()
      .single() // Expecting a single row back

    if (error) {
      console.error("Supabase insert error:", error)
      throw error
    }
    if (!insertedData) {
      throw new Error("Failed to register activity owner: No data returned.")
    }
    return insertedData // Return the data property
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
      // PGRST116: 'Requested range not satisfiable' often means no rows found
      if (error.code === 'PGRST116') { 
        return null
      }
      throw error
    }
    return data // Type is inferred correctly by maybeSingle
  },

  async updateActivityOwner(id: string, updates: ActivityOwnerUpdate): Promise<ActivityOwner> {
     // Ensure updates only contain valid columns for the Update type
    // Use 'data' property from the response, not 'result'
    const {  updatedData, error } = await supabase
      .from("activity_owners")
      .update(updates)
      .eq("id", id)
      .select()
      .single() // Expecting a single row back

    if (error) {
      console.error("Supabase update error:", error)
      throw error
    }
     if (!updatedData) {
      throw new Error("Failed to update activity owner: No data returned.")
    }
    return updatedData // Return the data property
  }
}

export default activityOwnerService
