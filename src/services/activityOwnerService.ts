
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
      // First check if the user already exists with this email
      const { data: existingOwners, error: checkError } = await supabase
        .from("activity_owners")
        .select("*")
        .eq("email", registrationData.email);

      if (checkError) {
        throw new Error(`Error checking existing owners: ${checkError.message}`);
      }

      if (existingOwners && existingOwners.length > 0) {
        throw { 
          code: "ACTIVITY_OWNER_EXISTS", 
          message: "An activity owner with this email already exists" 
        };
      }

      // Prepare data for API call
      const apiData = {
        email: registrationData.email,
        password: "temporary-password", // This will be set by the user later
        firstName: registrationData.owner_name.split(" ")[0],
        lastName: registrationData.owner_name.split(" ").slice(1).join(" "),
        phoneNumber: registrationData.phone,
        businessName: registrationData.business_name,
        businessAddress: registrationData.address,
        businessType: registrationData.business_type,
        taxId: registrationData.tax_id,
        location_lat: registrationData.location_lat,
        location_lng: registrationData.location_lng,
        place_id: registrationData.place_id
      };

      // Call the API endpoint to register the activity owner
      const response = await fetch("/api/register-activity-owner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to register activity owner");
      }

      return {
        success: true,
        message: "Activity owner registered successfully",
         result.data, 
        isNewUser: true, // Assuming API always creates a new auth user or links to existing
      };
    } catch (error: any) {
      console.error("Error registering activity owner:", error);
      if (error.code === "ACTIVITY_OWNER_EXISTS") {
        throw error;
      }
      throw new Error(error.message || "An unexpected error occurred during registration.");
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
    ownerId: number, 
    updates: Partial<ActivityOwner>
  ): Promise<ActivityOwner | null> {
    try {
      const { data, error } = await supabase
        .from("activity_owners")
        .update(updates)
        .eq("id", ownerId as unknown as string) // Casting to satisfy TS, Supabase should handle numeric ID
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
    } catch (error) {
      console.error("Error in getActivityOwnerProfile:", error);
      return null;
    }
  },
};

export default activityOwnerService;
