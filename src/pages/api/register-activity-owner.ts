import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/integrations/supabase/admin";
import type { Database } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from "uuid";

type ActivityOwnerInsert = Database["public"]["Tables"]["activity_owners"]["Insert"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const registrationData = req.body;

    if (!registrationData || !registrationData.email) {
        return res.status(400).json({ message: "Missing registration data or email" });
    }

    const { email, owner_name, phone, ...ownerDetails } = registrationData;

    try {
        // --- Server-Side Logic using supabaseAdmin ---

        // 1. Check if activity owner with this email already exists in activity_owners table
        const { existingOwnerData, error: ownerCheckError } = await supabaseAdmin
            .from("activity_owners")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (ownerCheckError) {
            console.error("Error checking existing activity owner:", ownerCheckError);
            return res.status(500).json({ message: "Database error checking owner existence." });
        }

        if (existingOwnerData) {
            console.log("Activity owner with this email already exists");
            return res.status(409).json({ message: "An activity owner account with this email already exists.", code: "ACTIVITY_OWNER_EXISTS" });
        }

        // 2. Check if user exists in auth.users using Admin API
        let authUserId: string | undefined;
        let isNewUser = false;
        let authUser = null;

        const { listUsersData, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({ email: email });

        if (listUsersError) {
            console.error("Error listing users from auth.users:", listUsersError);
        } else if (listUsersData && listUsersData.users && listUsersData.users.length > 0) {
            authUser = listUsersData.users[0];
            authUserId = authUser.id;
            console.log("User already exists in auth.users with ID:", authUserId);
        }

        // 3. If user doesn't exist in auth.users, create one
        if (!authUserId) {
            console.log("User does not exist in auth.users, creating new user...");
            const tempPassword = `temp-${uuidv4().substring(0, 8)}`;
            const { createUserData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: {
                    name: owner_name,
                    phone: phone,
                    user_type: "activity_provider",
                },
            });

            if (authError) {
                console.error("Error creating user in auth.users:", authError);
                if (authError.message.includes("User already registered")) {
                    return res.status(409).json({ message: "An account with this email already exists.", code: "AUTH_USER_EXISTS" });
                }
                return res.status(500).json({ message: "Failed to create authentication user." });
            }

            if (!createUserData || !createUserData.user || !createUserData.user.id) {
                throw new Error("Failed to create auth user: No user ID returned");
            }

            authUserId = createUserData.user.id;
            isNewUser = true;
            console.log("Created auth user with UUID:", authUserId);
        }

        if (!authUserId) {
            console.error("Critical error: Could not obtain authUserId.");
            return res.status(500).json({ message: "Failed to obtain user authentication ID." });
        }

        // 4. Check if user exists in public.users table, create if not
        const { publicUserData, error: publicUserCheckError } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("user_id", authUserId)
            .maybeSingle();

        if (publicUserCheckError) {
            console.error("Error checking public.users:", publicUserCheckError);
            if (isNewUser) await supabaseAdmin.auth.admin.deleteUser(authUserId);
            return res.status(500).json({ message: "Database error checking user profile." });
        }

        if (!publicUserData) {
            console.log("User does not exist in public.users, creating profile...");
            const userInsertData: UserInsert = {
                user_id: authUserId,
                name: owner_name,
                email: email,
                phone: phone || null,
                user_type: "activity_provider",
                verified: true,
            };
            const { error: publicUserInsertError } = await supabaseAdmin
                .from("users")
                .insert(userInsertData);

            if (publicUserInsertError) {
                console.error("Error creating user in public.users table:", publicUserInsertError);
                if (isNewUser) await supabaseAdmin.auth.admin.deleteUser(authUserId);
                return res.status(500).json({ message: "Failed to create user profile." });
            }
            console.log("Created public.users profile linked to auth user:", authUserId);
        } else {
            console.log("User profile already exists in public.users for auth user:", authUserId);
        }

        // 5. Insert new activity owner record, linked to the auth user ID
        console.log("Creating new activity owner record linked to user_id:", authUserId);
        const ownerId = uuidv4();
        const insertData: ActivityOwnerInsert = {
            id: ownerId,
            user_id: authUserId,
            email: email,
            owner_name: owner_name,
            phone: phone,
            status: "pending",
            ...ownerDetails,
        };

        const { newOwnerData, error: insertError } = await supabaseAdmin
            .from("activity_owners")
            .insert(insertData)
            .select()
            .single();

        if (insertError) {
            console.error("Supabase insert error for activity_owners:", insertError);
            if (isNewUser) {
                await supabaseAdmin.auth.admin.deleteUser(authUserId);
            }
            return res.status(500).json({ message: "Failed to register activity owner details." });
        }

        if (!newOwnerData) {
            throw new Error("Failed to register activity owner: No data returned after insert.");
        }

        // --- Success ---
        console.log("Activity owner registered successfully:", newOwnerData.id);
        return res.status(201).json({
            message: "Activity owner registered successfully.",
            newOwner: newOwnerData,
            isNewUser: isNewUser,
        });

    } catch (error: any) {
        console.error("Unhandled error in /api/register-activity-owner:", error);
        return res.status(500).json({ message: error.message || "An unexpected server error occurred." });
    }
}