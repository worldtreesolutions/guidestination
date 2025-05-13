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
            console.error("Supabase error checking existing activity owner:", ownerCheckError); // Log the full error server-side
            return res.status(500).json({
                message: "Database error during owner existence check. Supabase message: " + ownerCheckError.message,
                details: ownerCheckError.details || null,
                code: ownerCheckError.code || null
            });
        }

        if (existingOwnerData) {
            console.log("Activity owner with this email already exists:", existingOwnerData.id);
            return res.status(409).json({ message: "An activity owner account with this email already exists.", code: "ACTIVITY_OWNER_EXISTS" });
        }

        // 2. Check if user exists in auth.users using Admin API
        let authUserId: string | undefined;
        let isNewUser = false;
        let authUser = null;

        const { data: listUsersData, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({ email: email });

        if (listUsersError) {
            console.error("Error listing users from auth.users:", listUsersError);
            // Potentially return a more specific error, but for now, let it proceed to user creation if list fails but user might not exist
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
                    return res.status(409).json({ message: "An account with this email already exists in authentication.", code: "AUTH_USER_EXISTS" });
                }
                return res.status(500).json({ 
                    message: "Failed to create authentication user. Supabase message: " + authError.message,
                    details: (authError as any).details || null,
                    code: (authError as any).code || null 
                });
            }

            if (!createUserData || !createUserData.user || !createUserData.user.id) {
                // This case should ideally be caught by authError, but as a safeguard:
                console.error("Failed to create auth user: No user data returned from createUser call.");
                throw new Error("Failed to create auth user: No user ID returned");
            }

            authUserId = createUserData.user.id;
            isNewUser = true;
            console.log("Created auth user with UUID:", authUserId);
        }

        if (!authUserId) {
            console.error("Critical error: Could not obtain authUserId after checking/creating auth user.");
            return res.status(500).json({ message: "Failed to obtain user authentication ID." });
        }

        // 4. Check if user exists in public.users table, create if not
        const { publicUserData, error: publicUserCheckError } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("user_id", authUserId)
            .maybeSingle();

        if (publicUserCheckError) {
            console.error("Supabase error checking public.users:", publicUserCheckError);
            if (isNewUser) { // Attempt to clean up newly created auth user if profile creation fails
                try { await supabaseAdmin.auth.admin.deleteUser(authUserId); } catch (delErr) { console.error("Failed to cleanup auth user:", delErr); }
            }
            return res.status(500).json({ 
                message: "Database error checking user profile. Supabase message: " + publicUserCheckError.message,
                details: publicUserCheckError.details || null,
                code: publicUserCheckError.code || null
            });
        }

        if (!publicUserData) {
            console.log("User does not exist in public.users, creating profile for user_id:", authUserId);
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
                if (isNewUser) { // Attempt to clean up newly created auth user
                     try { await supabaseAdmin.auth.admin.deleteUser(authUserId); } catch (delErr) { console.error("Failed to cleanup auth user:", delErr); }
                }
                return res.status(500).json({ 
                    message: "Failed to create user profile. Supabase message: " + publicUserInsertError.message,
                    details: publicUserInsertError.details || null,
                    code: publicUserInsertError.code || null
                });
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
            if (isNewUser) { // Attempt to clean up
                try { await supabaseAdmin.auth.admin.deleteUser(authUserId); } catch (delErr) { console.error("Failed to cleanup auth user:", delErr); }
                // Also consider deleting from public.users if it was created in this request
            }
            return res.status(500).json({ 
                message: "Failed to register activity owner details. Supabase message: " + insertError.message,
                details: insertError.details || null,
                code: insertError.code || null
            });
        }

        if (!newOwnerData) {
            // This should ideally be caught by insertError, but as a safeguard:
            console.error("Failed to register activity owner: No data returned after insert.");
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
        // Ensure a JSON response for all unhandled errors
        return res.status(500).json({ 
            message: error.message || "An unexpected server error occurred.",
            error_details: error.toString() // Include string representation of the error
        });
    }
}