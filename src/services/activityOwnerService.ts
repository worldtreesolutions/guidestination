
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
  data?: ActivityOwner;
  isNewUser: boolean;
}

const activityOwnerService = {
  async registerActivityOwner(registrationData: ActivityOwnerRegistrationData): Promise<RegistrationResult> {
    try {
      // First check if an activity_owner record with this email already exists in the database
      const {  existingDbOwners, error: dbCheckError } = await supabase
        .from("activity_owners")
        .select("provider_id") 
        .eq("email", registrationData.email);

      if (dbCheckError && dbCheckError.code !== "PGRST116") { // PGRST116: No rows found for non-unique query
        console.error(`Error checking existing owners in DB: ${dbCheckError.message}`);
        throw new Error(`Error checking existing owners in DB: ${dbCheckError.message}`);
      }

      if (existingDbOwners && existingDbOwners.length > 0) {
        throw {
          code: "ACTIVITY_OWNER_EXISTS",
          message: "An activity owner with this email already exists in our records."
        };
      }
      
      const apiData = {
        email: registrationData.email,
        password: "temporary-password", 
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
        throw new Error(result.error || `API request failed with status ${response.status}`);
      }

      return {
        success: true,
        message: result.message || "Activity owner registered successfully",
        data: result.data, 
        isNewUser: result.isNewUser !== undefined ? result.isNewUser : true,
      };
    } catch (error: any) {
      console.error("Error registering activity owner:", error);
      if (error.code === "ACTIVITY_OWNER_EXISTS") {
        throw error; 
      }
      const errorMessage = error && typeof error.message === "string" ? error.message : "An unexpected error occurred during registration.";
      throw new Error(errorMessage);
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
  