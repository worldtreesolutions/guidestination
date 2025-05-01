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
}

export const activityOwnerService = {
  /**
   * Register an activity owner with multi-table process:
   * 1. Check if activity owner with email exists - if yes, throw error
   * 2. Check if user exists in users table
   * 3. If not, create user with verified=false
   * 4. Insert new activity owner record
   * 5. Create email verification record if new user
   */
  async registerActivityOwner(registrationData: ActivityOwnerRegistration): Promise<ActivityOwner & { isNewUser?: boolean; isExistingOwner?: boolean }> {
    console.log('Inside registerActivityOwner service method', registrationData);
    
    try {
      // Step 1: Check if activity owner with this email already exists
      const existingOwner = await this.getActivityOwnerByEmail(registrationData.email);
      
      if (existingOwner) {
        // If an activity owner with this email already exists, throw an error
        console.log('Activity owner with this email already exists');
        const error = new Error('An account with this email already exists. Please use a different email address to register.');
        // Add a custom code to identify this specific error
        (error as any).code = 'ACTIVITY_OWNER_EXISTS';
        throw error;
      }
      
      // Step 2: Check if user exists in users table
      const { exists: userExists, userId } = await authService.checkUserExists(registrationData.email);
      
      // Corrected: userId is a string (UUID)
      let actualUserId: string; 
      let isNewUser = false;
      
      // Step 3: If user doesn't exist, create one
      if (!userExists) {
        console.log('User does not exist, creating new user');
        const { userId: newUserId } = await authService.createUser({
          name: registrationData.owner_name,
          email: registrationData.email,
          phone: registrationData.phone,
          user_type: 'activity_provider'
        });
        
        actualUserId = newUserId; // Assign the string UUID
        isNewUser = true;
        
        // Step 4: Create email verification for new user (pass string UUID)
        await authService.createEmailVerification(newUserId); 
      } else {
        console.log('User already exists with ID:', userId);
        actualUserId = userId!; // Assign the existing string UUID
      }
      
      // Step 5: Insert new activity owner
      console.log('Creating new activity owner record');
      
      // Generate a UUID for the activity owner record
      const ownerId = uuidv4();
      
      const insertData: ActivityOwnerInsert = {
        id: ownerId,
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
        user_id: actualUserId // Link to the user record (string UUID)
      };

      console.log('Inserting activity owner with data:', insertData);

      const { data, error } = await supabase
        .from("activity_owners")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Failed to register activity owner: No data returned.");
      }
      
      // Return the data with the isNewUser flag
      return { ...data, isNewUser, isExistingOwner: false };
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
      .maybeSingle();

    if (error) {
      console.error("Supabase select error:", error);
      // PGRST116: 'Requested range not satisfiable' often means no rows found
      if (error.code === 'PGRST116') { 
        return null;
      }
      throw error;
    }
    return data;
  },

  async updateActivityOwner(id: string, updates: ActivityOwnerUpdate): Promise<ActivityOwner> {
    const { data, error } = await supabase
      .from("activity_owners")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    
    if (!data) {
      throw new Error("Failed to update activity owner: No data returned.");
    }
    
    return data;
  }
}

export default activityOwnerService