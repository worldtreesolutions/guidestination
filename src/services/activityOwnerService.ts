
        import { supabase } from "@/integrations/supabase/client";
        // Removed supabaseAdmin import - it should not be used client-side
        import type { Database } from "@/integrations/supabase/types";
        // Removed authService import for createUser/checkUserExists as logic moved to API
        import { v4 as uuidv4 } from "uuid"; // Keep for potential client-side ID generation if needed elsewhere

        // Define types based on the database table structure
        export type ActivityOwner = Database["public"]["Tables"]["activity_owners"]["Row"];
        export type ActivityOwnerInsert = Database["public"]["Tables"]["activity_owners"]["Insert"];
        export type ActivityOwnerUpdate = Database["public"]["Tables"]["activity_owners"]["Update"];

        // Define a specific type for the registration form data
        // This structure will be sent to the API route
        export interface ActivityOwnerRegistration {
          business_name: string;
          owner_name: string;
          email: string;
          phone: string;
          business_type: string;
          tax_id: string;
          address: string;
          description: string;
          tourism_license_number: string;
          tat_license_number?: string | null;
          guide_card_number?: string | null;
          insurance_policy: string;
          insurance_amount: string;
        }

        // Define the expected success response structure from the API route
        interface RegistrationApiResponse {
            message: string;
             ActivityOwner;
            isNewUser: boolean;
        }

        // Define the expected error response structure from the API route
        interface RegistrationApiErrorResponse {
            message: string;
            code?: string; // Optional error code (e.g., 'ACTIVITY_OWNER_EXISTS')
        }


        export const activityOwnerService = {
          /**
           * Register an activity owner by calling the server-side API route.
           */
          async registerActivityOwner(registrationData: ActivityOwnerRegistration): Promise<RegistrationApiResponse> {
            console.log("Calling API route /api/register-activity-owner with ", registrationData);

            try {
              const response = await fetch("/api/register-activity-owner", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(registrationData),
              });

              const result = await response.json();

              if (!response.ok) {
                console.error("API Error Response:", result);
                // Throw an error object that includes the message and potentially a code
                const error = new Error(result.message || `API request failed with status ${response.status}`);
                (error as any).code = result.code; // Attach the code if present
                 throw error;
              }

              console.log("API Success Response:", result);
              // Type assertion to ensure the success response matches our interface
              return result as RegistrationApiResponse;

            } catch (err) {
              console.error("Error calling registration API:", err);
              // Re-throw the error so the form can catch it
              throw err;
            }
          },

          /**
           * Get Activity Owner by Email (Client-Side Safe)
           * This uses the standard client which respects RLS.
           * Ensure RLS allows fetching owners if needed publicly or by specific roles.
           * If this needs admin privilege (e.g., checking existence before registration),
           * it should be part of the API route logic.
           * Keeping it here assumes it's for a different, RLS-safe purpose.
           */
          async getActivityOwnerByEmail(email: string): Promise<ActivityOwner | null> {
            const { data, error } = await supabase // Use standard client
              .from("activity_owners")
              .select("*")
              .eq("email", email)
              .maybeSingle();

            if (error) {
              console.error("Supabase select error (getActivityOwnerByEmail):", error);
              if (error.code === "PGRST116") {
                return null; // Not found is not an error here
              }
              // Don't throw sensitive errors to the client unless necessary
              // throw error;
              return null; // Or handle differently based on RLS/policy
            }
            return data;
          },

          /**
           * Update Activity Owner (Client-Side Safe)
           * This uses the standard client. RLS must allow the logged-in user
           * to update their own activity owner record.
           */
          async updateActivityOwner(id: string, updates: ActivityOwnerUpdate): Promise<ActivityOwner> {
            const { data, error } = await supabase // Use standard client
              .from("activity_owners")
              .update(updates)
              .eq("id", id) // Assuming 'id' is the UUID PK the user might know
              // Or potentially filter by user_id: .eq('user_id', authUserId) if RLS uses it
              .select()
              .single();

            if (error) {
              console.error("Supabase update error (updateActivityOwner):", error);
              throw new Error("Failed to update activity owner details."); // Generic error
            }

            if (!data) {
              throw new Error("Failed to update activity owner: No data returned.");
            }

            return data;
          },
        };

        export default activityOwnerService;
   