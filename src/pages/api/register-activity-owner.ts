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
                const {  existingOwner, error: ownerCheckError } = await supabaseAdmin
                    .from("activity_owners")
                    .select("id")
                    .eq("email", email)
                    .maybeSingle();

                if (ownerCheckError) {
                    console.error("Error checking existing activity owner:", ownerCheckError);
                    return res.status(500).json({ message: "Database error checking owner existence." });
                }

                if (existingOwner) {
                    console.log("Activity owner with this email already exists");
                    // Use a specific code for the client to handle
                    return res.status(409).json({ message: "An activity owner account with this email already exists.", code: "ACTIVITY_OWNER_EXISTS" });
                }

                // 2. Check if user exists in auth.users using Admin API
                let authUserId: string | undefined;
                let isNewUser = false;
                let authUser = null;

                // Use listUsers with email filter - more efficient than fetching all users
                const {  listUsersData, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({ email: email });

                if (listUsersError) {
                     // Handle specific errors if needed, e.g., rate limits
                     console.error("Error listing users from auth.users:", listUsersError);
                     // Don't necessarily fail here, maybe the user just doesn't exist yet
                } else if (listUsersData && listUsersData.users && listUsersData.users.length > 0) {
                    authUser = listUsersData.users[0];
                    authUserId = authUser.id;
                    console.log("User already exists in auth.users with ID:", authUserId);
                }


                // 3. If user doesn't exist in auth.users, create one
                if (!authUserId) {
                    console.log("User does not exist in auth.users, creating new user...");
                    const tempPassword = `temp-${uuidv4().substring(0, 8)}`;
                    const {  createUserData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                        email: email,
                        password: tempPassword,
                        email_confirm: true, // Auto-confirm email for now, adjust if verification flow is needed
                        user_metadata: {
                            name: owner_name,
                            phone: phone,
                            user_type: "activity_provider", // Store basic type here if needed
                        },
                    });

                    if (authError) {
                        console.error("Error creating user in auth.users:", authError);
                        // Check for specific errors like email already exists (though listUsers should catch it)
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

                    // Optional: Send custom verification or welcome email here if needed
                }

                // Ensure we have an authUserId before proceeding
                 if (!authUserId) {
                    console.error("Critical error: Could not obtain authUserId.");
                    return res.status(500).json({ message: "Failed to obtain user authentication ID." });
                }


                // 4. Check if user exists in public.users table, create if not
                 const {  publicUser, error: publicUserCheckError } = await supabaseAdmin
                    .from("users")
                    .select("id")
                    .eq("user_id", authUserId) // Check using the UUID link
                    .maybeSingle();

                 if (publicUserCheckError) {
                     console.error("Error checking public.users:", publicUserCheckError);
                     // Attempt cleanup of auth user if public user check fails critically
                     if (isNewUser) await supabaseAdmin.auth.admin.deleteUser(authUserId);
                     return res.status(500).json({ message: "Database error checking user profile." });
                 }

                 if (!publicUser) {
                     console.log("User does not exist in public.users, creating profile...");
                     const userInsertData: UserInsert = {
                         user_id: authUserId, // Link to the auth.users table
                         name: owner_name,
                         email: email,
                         phone: phone || null,
                         user_type: "activity_provider",
                         verified: true, // Mark as verified since email_confirm was true, adjust if needed
                         // Add role_id if you have a roles table and need to assign one
                     };
                     const { error: publicUserInsertError } = await supabaseAdmin
                         .from("users")
                         .insert(userInsertData);

                     if (publicUserInsertError) {
                         console.error("Error creating user in public.users table:", publicUserInsertError);
                         // Attempt cleanup of auth user
                         if (isNewUser) await supabaseAdmin.auth.admin.deleteUser(authUserId);
                         return res.status(500).json({ message: "Failed to create user profile." });
                     }
                     console.log("Created public.users profile linked to auth user:", authUserId);
                 } else {
                     console.log("User profile already exists in public.users for auth user:", authUserId);
                     // Optionally update the public.users record here if needed
                 }


                // 5. Insert new activity owner record, linked to the auth user ID
                console.log("Creating new activity owner record linked to user_id:", authUserId);
                const ownerId = uuidv4(); // Generate a new UUID for the activity_owners primary key
                const insertData: ActivityOwnerInsert = {
                    id: ownerId, // Explicitly set the UUID primary key
                    user_id: authUserId, // Foreign key linking to auth.users.id
                    email: email,
                    owner_name: owner_name,
                    phone: phone,
                    status: "pending", // Default status
                    ...ownerDetails, // Spread the rest of the details (business_name, address, etc.)
                };

                const {  newOwner, error: insertError } = await supabaseAdmin
                    .from("activity_owners")
                    .insert(insertData)
                    .select()
                    .single();

                if (insertError) {
                    console.error("Supabase insert error for activity_owners:", insertError);
                     // Attempt cleanup of auth user and potentially public user if this fails
                     if (isNewUser) {
                         await supabaseAdmin.auth.admin.deleteUser(authUserId);
                         // Consider deleting from public.users as well if created in this request
                     }
                    return res.status(500).json({ message: "Failed to register activity owner details." });
                }

                if (!newOwner) {
                    throw new Error("Failed to register activity owner: No data returned after insert.");
                }

                // --- Success ---
                console.log("Activity owner registered successfully:", newOwner.id);
                return res.status(201).json({
                    message: "Activity owner registered successfully.",
                     newOwner,
                    isNewUser: isNewUser,
                });

            } catch (error: any) {
                console.error("Unhandled error in /api/register-activity-owner:", error);
                return res.status(500).json({ message: error.message || "An unexpected server error occurred." });
            }
        }