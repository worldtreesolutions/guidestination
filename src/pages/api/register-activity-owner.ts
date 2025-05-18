
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
        const { data: existingDbOwner, error: ownerCheckError } = await supabaseAdmin
            .from("activity_owners")
            .select("provider_id") 
            .eq("email", email)
            .single();

        if (ownerCheckError && ownerCheckError.code !== "PGRST116") { // PGRST116: "No rows found" - this is okay if no owner exists
            console.error("Error checking existing owner in DB:", ownerCheckError);
            return res.status(500).json({ error: "Error checking existing owner details." });
        }

        if (existingDbOwner) {
            return res.status(400).json({ error: "An activity owner with this email already exists in our records." });
        }

        // Attempt to create the authentication user
        const { data: authCreationData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, 
            user_metadata: { 
                firstName: firstName,
                lastName: lastName || "", 
                role: "activity_owner"
            }
        });
        
        console.log("Auth Creation Attempt Response: Data:", JSON.stringify(authCreationData), "Error:", JSON.stringify(createUserError));


        if (createUserError) {
            console.error("Error creating auth user:", createUserError.message, "Full error:", JSON.stringify(createUserError));
            // Check if the error is due to the user already being registered in the auth system
            if (createUserError.message && 
                (createUserError.message.toLowerCase().includes("user already registered") || 
                 createUserError.message.toLowerCase().includes("email address has already been registered"))) {
                return res.status(409).json({ error: "A user with this email address has already been registered. Please try logging in or use a different email." });
            }
            return res.status(500).json({ error: createUserError.message || "Failed to create authentication user." });
        }

        if (!authCreationData || !authCreationData.user) { 
            console.error("Auth user creation did not return a user object. Full authCreationData object:", JSON.stringify(authCreationData));
            return res.status(500).json({ error: "Auth user creation did not return a user object." });
        }
        
        const authUser: User = authCreationData.user;

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
            location_lat: location_lat || null,
            location_lng: location_lng || null,
            place_id: place_id || null,
        };

        const { data: newOwnerData, error: createOwnerError } = await supabaseAdmin
            .from("activity_owners")
            .insert(ownerInsertData)
            .select() 
            .single<ActivityOwnerRow>();

        if (createOwnerError) {
            console.error("Error creating owner record in DB:", createOwnerError);
            // If creating the DB record fails, roll back the auth user creation
            await supabaseAdmin.auth.admin.deleteUser(authUser.id);
            return res.status(500).json({ error: "Failed to create activity owner profile in database." });
        }

        return res.status(200).json({ 
            message: "Activity owner registered successfully. Please check your email for verification.",
             newOwnerData, 
            isNewUser: true 
        });

    } catch (error: any) {
        console.error("Server error during registration:", error);
        const errorMessage = error && typeof error.message === "string" ? error.message : "Internal server error during registration.";
        return res.status(500).json({ error: errorMessage });
    }
}
