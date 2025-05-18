
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
  async registerActivityOwner(data: ActivityOwnerRegistrationData): Promise<RegistrationResult> {
    try {
      // First check if the user already exists with this email
      const { data: existingOwners, error: checkError } = await supabase
        .from("activity_owners")
        .select("*")
        .eq("email", data.email);

      if (checkError) {
        throw { message: "Error checking existing owners", ...checkError };
      }

      if (existingOwners && existingOwners.length > 0) {
        throw { 
          code: "ACTIVITY_OWNER_EXISTS", 
          message: "An activity owner with this email already exists" 
        };
      }

      // Prepare data for API call
      const apiData = {
        email: data.email,
        password: "temporary-password", // This will be set by the user later
        firstName: data.owner_name.split(" ")[0],
        lastName: data.owner_name.split(" ").slice(1).join(" "),
        phoneNumber: data.phone,
        businessName: data.business_name,
        businessAddress: data.address,
        businessType: data.business_type,
        taxId: data.tax_id,
        location_lat: data.location_lat,
        location_lng: data.location_lng,
        place_id: data.place_id
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
        throw { message: result.error || "Failed to register activity owner" };
      }

      return {
        success: true,
        message: "Activity owner registered successfully",
        data: result.data,
        isNewUser: true,
      };
    } catch (error: any) {
      console.error("Error registering activity owner:", error);
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
    ownerId: number,
    updates: Partial<ActivityOwner>
  ): Promise<ActivityOwner | null> {
    try {
      const { data, error } = await supabase
        .from("activity_owners")
        .update(updates)
        .eq("id", ownerId)
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
