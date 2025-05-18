
import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/integrations/supabase/admin"
import type { Database } from "@/integrations/supabase/types"

type ActivityOwnerInsert = Database["public"]["Tables"]["activity_owners"]["Insert"]

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
        const {  existingOwnerData, error: ownerCheckError } = await supabaseAdmin
            .from("activity_owners")
            .select("provider_id") 
            .eq("email", email)
            .single()

        if (ownerCheckError && ownerCheckError.code !== "PGRST116") { 
            console.error("Error checking existing owner in DB:", ownerCheckError)
            return res.status(500).json({ error: "Error checking existing owner details." })
        }

        if (existingOwnerData) {
            return res.status(400).json({ error: "An activity owner with this email already exists." })
        }

        const {  authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, 
            user_meta: { 
                firstName: firstName,
                lastName: lastName || "", 
                role: "activity_owner"
            }
        })

        if (createUserError) {
            console.error("Error creating auth user:", createUserError)
            return res.status(500).json({ error: createUserError.message || "Failed to create authentication user." })
        }

        if (!authData || !authData.user) { 
            return res.status(500).json({ error: "Auth user creation did not return a user object." })
        }

        const ownerInsertData: ActivityOwnerInsert = {
            user_id: authData.user.id, 
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
        }

        const {  newOwnerData, error: createOwnerError } = await supabaseAdmin
            .from("activity_owners")
            .insert(ownerInsertData)
            .select() 
            .single()

        if (createOwnerError) {
            console.error("Error creating owner record in DB:", createOwnerError)
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return res.status(500).json({ error: "Failed to create activity owner profile in database." })
        }

        return res.status(200).json({ 
            message: "Activity owner registered successfully. Please check your email for verification.",
             newOwnerData, 
            isNewUser: true 
        })

    } catch (error: any) {
        console.error("Server error during registration:", error)
        const errorMessage = error && typeof error.message === "string" ? error.message : "Internal server error during registration.";
        return res.status(500).json({ error: errorMessage })
    }
}
  