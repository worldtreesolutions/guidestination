
import { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/integrations/supabase/admin"
import type { Database } from "@/integrations/supabase/types"

type ActivityOwner = Database["public"]["Tables"]["activity_owners"]["Row"]

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
        bankAccount,
        bankName,
        bankBranch,
    } = req.body

    if (!email || !password || !firstName || !lastName || !phoneNumber) {
        return res.status(400).json({ error: "Missing required fields" })
    }

    try {
        // 1. Check if an activity_owner record with this email already exists
        const { data: existingOwnerData, error: ownerCheckError } = await supabaseAdmin
            .from("activity_owners")
            .select("id")
            .eq("email", email)
            .single()

        if (ownerCheckError && ownerCheckError.code !== "PGRST116") {
            console.error("Error checking existing owner:", ownerCheckError)
            return res.status(500).json({ error: "Error checking existing owner" })
        }

        if (existingOwnerData) {
            return res.status(400).json({ error: "An activity owner with this email already exists" })
        }

        // 2. Create auth user
        const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                firstName,
                lastName,
                role: "activity_owner"
            }
        })

        if (createUserError) {
            console.error("Error creating user:", createUserError)
            return res.status(500).json({ error: createUserError.message })
        }

        if (!authData.user) {
            return res.status(500).json({ error: "Failed to create user" })
        }

        // 3. Create activity owner record with correct types
        const ownerInsertData = {
            user_id: authData.user.id,
            owner_name: `${firstName} ${lastName}`,
            email,
            phone: phoneNumber,
            business_name: businessName,
            business_type: businessType,
            tax_id: taxId,
            address: businessAddress,
            description: "",
            tourism_license_number: "",
            bank_name: bankName,
            bank_branch: bankBranch,
            status: "pending"
        }

        const { data: ownerData, error: createOwnerError } = await supabaseAdmin
            .from("activity_owners")
            .insert(ownerInsertData)
            .select()
            .single()

        if (createOwnerError) {
            console.error("Error creating owner record:", createOwnerError)
            // Attempt to delete the auth user since owner creation failed
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return res.status(500).json({ error: "Failed to create owner record" })
        }

        return res.status(200).json({ 
            message: "Activity owner registered successfully",
            data: ownerData
        })

    } catch (error) {
        console.error("Server error:", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}
