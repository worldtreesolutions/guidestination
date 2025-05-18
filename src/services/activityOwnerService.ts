
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
      const apiData = {
        email: registrationData.email,
        password: "temporary-password", // Ensure temporary password is included
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
        console.error("API Error in registerActivityOwner:", result.error || `API request failed with status ${response.status}`);
        throw new Error(result.error || `API request failed with status ${response.status}`);
      }

      return {
        success: true,
        message: result.message || "Activity owner registered successfully",
         result.data as ActivityOwner,
        isNewUser: result.isNewUser !== undefined ? result.isNewUser : true,
      };
    } catch (error: any) {
      console.error("Error registering activity owner (service):", error.message || error);
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
        if (error.code !== "PGRST116") { 
          console.error("Error fetching activity owner by user ID:", error);
        }
        return null;
      }
      return data;
    } catch (error) {
      console.error("Unexpected error in getActivityOwnerByUserId:", error);
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
      console.error("Unexpected error in updateActivityOwner:", error);
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
        if (error.code !== "PGRST116") {
          console.error("Error fetching activity owner profile:", error);
        }
        return null;
      }
      return data;
    } catch (error: any) {
      console.error("Unexpected error in getActivityOwnerProfile:", error);
      return null;
    }
  } 
}; 

export default activityOwnerService;
