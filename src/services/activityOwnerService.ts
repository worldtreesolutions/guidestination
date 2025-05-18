
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ActivityOwner = Database["public"]["Tables"]["activity_owners"]["Row"];

interface ActivityOwnerRegistrationData {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  business_type: string;
  tax_id: string;
  address: string;
  description: string;
  tourism_license_number: string;
  tat_license_number: string | null;
  guide_card_number: string | null;
  insurance_policy: string;
  insurance_amount: string;
  location_lat?: number | null;
  location_lng?: number | null;
  place_id?: string | null;
}

interface RegistrationResult {
  success: boolean;
  message: string;
  data?: ActivityOwner; // This should match the type of 'newOwnerData' from the API
  isNewUser: boolean;
}

const activityOwnerService = {
  async registerActivityOwner(registrationData: ActivityOwnerRegistrationData): Promise<RegistrationResult> {
    try {
      // The client-side service no longer directly checks the DB for existing owners.
      // This check is now handled by the API route.
      
      const apiData = {
        email: registrationData.email,
        // Password is set server-side by the API route
        // password: "temporary-password", 
        firstName: registrationData.owner_name.split(" ")[0],
        lastName: registrationData.owner_name.split(" ").slice(1).join(" "),
        phoneNumber: registrationData.phone,
        businessName: registrationData.business_name,
        businessAddress: registrationData.address,
        businessType: registrationData.business_type,
        taxId: registrationData.tax_id,
        description: registrationData.description,
        tourism_license_number: registrationData.tourism_license_number,
        tat_license_number: registrationData.tat_license_number,
        guide_card_number: registrationData.guide_card_number,
        insurance_policy: registrationData.insurance_policy,
        insurance_amount: registrationData.insurance_amount,
        location_lat: registrationData.location_lat,
        location_lng: registrationData.location_lng,
        place_id: registrationData.place_id
      };

      const response = await fetch("/api/register-activity-owner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData), 
      });

      const result = await response.json();

      if (!response.ok) {
        // The API route now returns specific error messages and codes (e.g., 409 for existing auth user)
        // We can throw an error with the message from the API
        throw new Error(result.error || `API request failed with status ${response.status}`);
      }

      // The API now returns 'data' which contains the newOwnerData (ActivityOwnerRow)
      return {
        success: true,
        message: result.message || "Activity owner registered successfully",
         result.data as ActivityOwner, // Corrected: Added '' key
        isNewUser: result.isNewUser !== undefined ? result.isNewUser : true,
      };
    } catch (error: any) {
      console.error("Error registering activity owner (service):", error);
      // Re-throw the error so the form can catch it and display the message
      // The error message should now be more specific from the API
      throw error; 
    }
  },

  async getActivityOwnerByUserId(userId: string): Promise<ActivityOwner | null> {
    try {
      const { data, error } = await supabase
        .from("activity_owners")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching activity owner:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getActivityOwnerByUserId:", error);
      return null;
    }
  },

  async updateActivityOwner(
    ownerId: string, 
    updates: Partial<ActivityOwner>
  ): Promise<ActivityOwner | null> {
    try {
      const { data, error } = await supabase
        .from("activity_owners")
        .update(updates)
        .eq("provider_id", ownerId) 
        .select()
        .single();

      if (error) {
        console.error("Error updating activity owner:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in updateActivityOwner:", error);
      return null;
    }
  },

  async getActivityOwnerProfile(userId: string): Promise<ActivityOwner | null> {
    try {
      const { data, error } = await supabase
        .from("activity_owners")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching activity owner profile:", error);
        return null;
      }

      return data;
    } catch (error: any) { 
      console.error("Error in getActivityOwnerProfile:", error);
      return null;
    }
  },
};

export default activityOwnerService;
  