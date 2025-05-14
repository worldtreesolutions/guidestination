
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/integrations/supabase/admin";
import type { Database } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from "uuid";
import type { User } from "@supabase/supabase-js";

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
        // 1. Check if an activity_owner record with this email already exists
        const {  existingOwner, error: ownerCheckError } = await supabaseAdmin
            .from("activity_owners")
            .select("provider_id")
            .eq("email", email)
            .maybeSingle();

        if (ownerCheckError) {
            console.error("Supabase error checking existing activity_owners record:", ownerCheckError);
            return res.status(500).json({
                message: "Database error during owner existence check. Supabase message: " + ownerCheckError.message,
                details: ownerCheckError.details || null,
                code: ownerCheckError.code || null
            });
        }

        if (existingOwner) {
            console.log("Activity owner profile already exists in activity_owners table with email:", email);
            return res.status(409).json({ message: "An activity owner account with this email already exists.", code: "ACTIVITY_OWNER_EXISTS" });
        }

        // 2. Handle auth.users: Create or find existing auth user
        let authUserId: string | undefined;
        let isNewUser = false;
        const tempPassword = `temp-${uuidv4().substring(0, 8)}`; 

        console.log(`Attempting to create or identify auth user for email: "${email}"`);
        const {   createUserData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true, 
            options: {
                 { // Corrected: user_metadata for createUser goes into options.data
                    name: owner_name,
                    phone: phone,
                    user_type: "activity_provider", 
                }
            }
        });
        
        if (authError) {
            const emailExistsErrorMessages = [
                "User already registered",
                "A user with this email address has already been registered",
                "duplicate key value violates unique constraint" 
            ];
            const isEmailExistsError = emailExistsErrorMessages.some(msg => authError.message.toLowerCase().includes(msg.toLowerCase())) ||
                                     (authError as any).code === "email_exists" || 
                                     ((authError as any).status === 400 && authError.message.toLowerCase().includes("user already exists"));

            if (isEmailExistsError) {
                console.log(`Auth user with email "${email}" already exists (reported by createUser). Attempting to retrieve them by listing users.`);
                
                const {   listUsersData, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({ email: email });

                if (listUsersError) {
                    console.error(`Error listing users by email "${email}":`, listUsersError);
                    return res.status(500).json({ message: `Failed to list existing users by email: ${listUsersError.message}` });
                }

                const foundUser = listUsersData && listUsersData.users && listUsersData.users.length > 0 ? listUsersData.users[0] : null;

                if (foundUser && foundUser.id) {
                    authUserId = foundUser.id;
                    isNewUser = false; 
                    console.log(`Found existing auth user ID: ${authUserId} for email "${email}" using listUsers.`);
                    const { error: updateUserMetaError } = await supabaseAdmin.auth.admin.updateUserById(
                        authUserId,
                        { 
                            user_meta { // Corrected key for user_metadata and standard object syntax
                                name: owner_name, 
                                phone: phone, 
                                user_type: "activity_provider" 
                            } 
                        }
                    );
                    if (updateUserMetaError) {
                        console.warn(`Could not update metadata for existing auth user ${authUserId}:`, updateUserMetaError.message);
                    }
                } else {
                    console.error(`Auth user with email "${email}" confirmed to exist (per createUser error), but could NOT be found via listUsers. Response: ${JSON.stringify(listUsersData)}`);
                    return res.status(500).json({ message: "User confirmed to exist but could not be retrieved by email. Please contact support." });
                }

            } else {
                console.error("Error creating user in auth.users:", authError);
                return res.status(500).json({
                    message: "Failed to create authentication user. Supabase message: " + authError.message,
                    details: (authError as any).details || null,
                    code: (authError as any).code || null
                });
            }
        } else if (createUserData && createUserData.user && createUserData.user.id) {
            authUserId = createUserData.user.id;
            isNewUser = true;
            console.log(`Created new auth user with UUID: ${authUserId} for email "${email}"`);
        } else {
            console.error("Failed to create auth user: No user data or user ID returned from createUser call, and no error.", createUserData);
            return res.status(500).json({ message: "Failed to create auth user: Unexpected response from Supabase.", error_details: "User object or ID missing in Supabase response without error."});
        }
        
        if (!authUserId) {
            console.error("Critical error: Could not obtain authUserId after auth user handling.");
            return res.status(500).json({ message: "Failed to obtain user authentication ID." });
        }

        // 3. Ensure user profile exists in public.users table
        const {   publicUser, error: publicUserCheckError } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("user_id", authUserId)
            .maybeSingle();

        if (publicUserCheckError) {
            console.error("Supabase error checking public.users:", publicUserCheckError);
            if (isNewUser && authUserId) { 
                try { await supabaseAdmin.auth.admin.deleteUser(authUserId); } catch (delErr) { console.error("Failed to cleanup new auth user after public.users check error:", delErr); }
            }
            return res.status(500).json({
                message: "Database error checking user profile. Supabase message: " + publicUserCheckError.message,
                details: publicUserCheckError.details || null,
                code: publicUserCheckError.code || null
            });
        }

        if (!publicUser) {
            console.log("User does not exist in public.users, creating profile for user_id:", authUserId);
            const userInsertPayload: UserInsert = {
                user_id: authUserId,
                name: owner_name,
                email: email,
                phone: phone || null,
                user_type: "activity_provider", 
                verified: true, 
            };
            const { error: publicUserInsertError } = await supabaseAdmin
                .from("users")
                .insert(userInsertPayload);

            if (publicUserInsertError) {
                console.error("Error creating user in public.users table:", publicUserInsertError);
                if (isNewUser && authUserId) { 
                     try { await supabaseAdmin.auth.admin.deleteUser(authUserId); } catch (delErr) { console.error("Failed to cleanup new auth user after public.users insert error:", delErr); }
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
            const { error: publicUserUpdateError } = await supabaseAdmin
                .from("users")
                .update({ name: owner_name, phone: phone || null, user_type: "activity_provider", verified: true })
                .eq("user_id", authUserId);
            if (publicUserUpdateError) {
                console.warn("Could not update existing public.users profile:", publicUserUpdateError.message);
            }
        }

        // 4. Insert new activity_owners record
        console.log("Creating new activity_owners record linked to user_id:", authUserId);
        const ownerInsertPayload: ActivityOwnerInsert = {
            user_id: authUserId,
            email: email, 
            owner_name: owner_name,
            phone: phone,
            status: "pending", 
            ...ownerDetails, 
        };

        const {   newOwnerRecord, error: insertError } = await supabaseAdmin
            .from("activity_owners")
            .insert(ownerInsertPayload)
            .select()
            .single();

        if (insertError) {
            console.error("Supabase insert error for activity_owners:", insertError);
            if (isNewUser && authUserId) {
                try { await supabaseAdmin.auth.admin.deleteUser(authUserId); console.log("Rolled back new auth user creation due to activity_owners insert error."); } catch (delErr) { console.error("Failed to cleanup new auth user after activity_owners insert error:", delErr); }
            }
            return res.status(500).json({
                message: "Failed to register activity owner details. Supabase message: " + insertError.message,
                details: insertError.details || null,
                code: insertError.code || null
            });
        }

        if (!newOwnerRecord) {
            console.error("Failed to register activity owner: No data returned after insert into activity_owners.");
             if (isNewUser && authUserId) {
                try { await supabaseAdmin.auth.admin.deleteUser(authUserId); console.log("Rolled back new auth user creation as activity_owners insert returned no data."); } catch (delErr) { console.error("Failed to cleanup new auth user after activity_owners insert returned no data.", delErr); }
            }
            return res.status(500).json({ message: "Failed to register activity owner: No data returned after insert.", error_details: "Activity owner data missing post-insert."});
        }

        console.log("Activity owner registered successfully, provider_id:", newOwnerRecord.provider_id);
        return res.status(201).json({
            message: "Activity owner registered successfully.",
            newOwner: newOwnerRecord,
            isNewUser: isNewUser, 
        });

    } catch (error: any) {
        console.error("Unhandled error in /api/register-activity-owner:", error);
        return res.status(500).json({
            message: error.message || "An unexpected server error occurred.",
            error_details: error.toString()
        });
    }
}
