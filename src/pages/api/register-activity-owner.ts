
import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/integrations/supabase/admin"
import type { Database } from "@/integrations/supabase/types"
import { User } from "@supabase/supabase-js"

type ActivityOwnerInsert = Database["public"]["Tables"]["activity_owners"]["Insert"]
type ActivityOwnerRow = Database["public"]["Tables"]["activity_owners"]["Row"]

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    const {
        email,
        password,
        firstName,
        lastName, 
        phoneNumber,
        businessName,
        businessAddress,
        businessType,
        taxId,
        description, 
        tourism_license_number, 
        tat_license_number,
        guide_card_number,
        insurance_policy, 
        insurance_amount, 
        location_lat,
        location_lng,
        place_id,
    } = req.body

    console.log("API: Received raw location ", { location_lat, location_lng, place_id });

    const requiredFields: Record<string, any> = {
        email, password, firstName, phoneNumber, businessName, 
        businessAddress, businessType, taxId, description, 
        tourism_license_number, insurance_policy, insurance_amount
    };

    const missingFields = Object.keys(requiredFields).filter(key => {
      const value = requiredFields[key];
      return value === null || value === undefined || value === "";
    });

    if (missingFields.length > 0) {
        console.error("API Error - Missing required fields:", missingFields.join(", "), "Received body:", req.body);
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` })
    }

    try {
        // Check if an activity_owner record already exists in the database for this email
        const {  existingDbOwner, error: ownerCheckError } = await supabaseAdmin
            .from("activity_owners")
            .select("provider_id") 
            .eq("email", email)
            .single();

        if (ownerCheckError && ownerCheckError.code !== "PGRST116") { // PGRST116: "No rows found" - this is okay
            console.error("API Error: Error checking existing owner in DB:", ownerCheckError);
            return res.status(500).json({ error: "Error checking existing owner details." });
        }

        if (existingDbOwner) {
            console.log("API Info: Activity owner with this email already exists in activity_owners table.");
            return res.status(400).json({ error: "An activity owner with this email already exists in our records." });
        }

        // Attempt to create the authentication user
        const {  authCreationResponse, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, 
            user_meta: { 
                firstName: firstName,
                lastName: lastName || "", 
                role: "activity_owner"
            }
        });
        
        console.log("API: Auth Creation Attempt Response: Data:", JSON.stringify(authCreationResponse), "Error:", JSON.stringify(createUserError));

        if (createUserError) {
            console.error("API Error: Error creating auth user:", createUserError.message, "Full error:", JSON.stringify(createUserError));
            if (createUserError.message && 
                (createUserError.message.toLowerCase().includes("user already registered") || 
                 createUserError.message.toLowerCase().includes("email address has already been registered") ||
                 createUserError.message.toLowerCase().includes("duplicate key value violates unique constraint"))) { 
                return res.status(409).json({ error: "A user with this email address has already been registered. Please try logging in or use a different email." });
            }
            return res.status(500).json({ error: createUserError.message || "Failed to create authentication user." });
        }

        const authUser = authCreationResponse?.user;

        if (!authUser) { 
            console.error("API Error: Auth user creation did not return a user object. Full authCreationResponse object:", JSON.stringify(authCreationResponse));
            return res.status(500).json({ error: "Auth user creation did not return a user object." });
        }
        
        // Create the activity_owner profile in the database
        const ownerInsertData: ActivityOwnerInsert = {
            user_id: authUser.id, 
            owner_name: `${firstName} ${lastName || ""}`.trim(),
            email,
            phone: phoneNumber,
            business_name: businessName,
            business_type: businessType,
            tax_id: taxId,
            address: businessAddress,
            description: description,
            tourism_license_number: tourism_license_number,
            tat_license_number: tat_license_number || null,
            guide_card_number: guide_card_number || null,
            status: "pending", 
            insurance_policy: insurance_policy,
            insurance_amount: insurance_amount.toString(), 
            location_lat: typeof location_lat === "number" ? location_lat : null,
            location_lng: typeof location_lng === "number" ? location_lng : null,
            place_id: typeof place_id === "string" ? place_id : null,
        };

        console.log("API: Data being prepared for insert into activity_owners:", JSON.stringify(ownerInsertData, null, 2));

        const {  newOwnerData, error: createOwnerError } = await supabaseAdmin
            .from("activity_owners")
            .insert(ownerInsertData)
            .select() 
            .single<ActivityOwnerRow>();

        if (createOwnerError) {
            console.error("API Error: Error creating owner record in DB:", createOwnerError);
            // If creating the DB record fails, roll back the auth user creation
            await supabaseAdmin.auth.admin.deleteUser(authUser.id);
            console.log(`API Info: Rolled back auth user creation for ${authUser.id} due to DB insert failure.`);
            return res.status(500).json({ error: "Failed to create activity owner profile in database. " + createOwnerError.message });
        }

        console.log("API Success: Activity owner registered successfully. DB Data:", newOwnerData);
        return res.status(200).json({ 
            message: "Activity owner registered successfully. Please check your email for verification.",
             newOwnerData, 
            isNewUser: true 
        });

    } catch (error: any) {
        console.error("API Error: Server error during registration:", error);
        const errorMessage = error && typeof error.message === "string" ? error.message : "Internal server error during registration.";
        return res.status(500).json({ error: errorMessage });
    }
}
