import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"
import authService from './authService';
import { v4 as uuidv4 } from 'uuid';

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
  /**
   * Register an activity owner with multi-table process:
   * 1. Check if user exists in users table
   * 2. If not, create user with verified=false
   * 3. Insert into activity_owners table
   * 4. Create email verification record
   */
  async registerActivityOwner(registrationData: ActivityOwnerRegistration): Promise<ActivityOwner & { isNewUser?: boolean }> {
    console.log('Inside registerActivityOwner service method', registrationData);
    
    try {
      // Step 1: Check if user exists
      const { exists, userId } = await authService.checkUserExists(registrationData.email);
      
      let actualUserId: number;
      let isNewUser = false;
      
      // Step 2: If user doesn't exist, create one
      if (!exists) {
        console.log('User does not exist, creating new user');
        const { userId: newUserId } = await authService.createUser({
          name: registrationData.owner_name,
          email: registrationData.email,
          phone: registrationData.phone,
          user_type: 'activity_provider'
        });
        
        actualUserId = newUserId;
        isNewUser = true;
        
        // Step 3: Create email verification
        await authService.createEmailVerification(newUserId);
      } else {
        console.log('User already exists with ID:', userId);
        actualUserId = userId!;
      }
      
      // Generate a UUID for the activity owner record
      const ownerId = uuidv4();
      
      // Generate a UUID for the user_id field as well, since it's a UUID in the database
      const userUuid = uuidv4();
      
      // Step 4: Insert into activity_owners table
      const insertData: ActivityOwnerInsert = {
        id: ownerId, // Use UUID for the activity_owners table
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
        status: 'pending',
        user_id: userUuid // Use UUID for the user_id field
      };

      console.log('Inserting activity owner with data:', insertData);

      const { data, error } = await supabase
        .from("activity_owners")
        .insert(insertData) // Use the correctly typed insert data
        .select()
        .single() // Expecting a single row back

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error("Supabase insert error:", error)
        throw error
      }
      
      if (!data) {
        throw new Error("Failed to register activity owner: No data returned.")
      }
      
      // Return the data with the isNewUser flag
      return { ...data, isNewUser };
    } catch (err) {
      console.error('Error in registerActivityOwner:', err);
      throw err;
    }
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