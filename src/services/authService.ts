
import { supabase } from "@/integrations/supabase/client";
// supabaseAdmin cannot be used on the client-side, remove if not specifically for a server-side context within this file
// import { supabaseAdmin } from "@/integrations/supabase/admin"; 
import { Session, User, UserAttributes, WeakPassword } from "@supabase/supabase-js";

// Define a type for user metadata (within user_metadata object)
export interface CustomUserMetadata {
  name?: string;
  verified?: boolean;
  user_type?: string;
  phone?: string;
  [key: string]: any;
}

// Define a type for the user verification status
export interface UserVerificationStatus {
  exists: boolean;
  verified: boolean;
}

export interface UserRegistration {
  name: string;
  email: string;
  phone?: string;
  user_type?: string;
  password?: string;
}

export const authService = {
  /**
   * Sign in with email and password using Supabase Auth
   */
  async signInWithEmail(email: string, password: string): Promise<{ user: User | null; session: Session | null; roleId: number | null; providerId: string | null }> {
    const {  signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Supabase sign-in error:", signInError.message);
      if (signInError.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password.");
      } else if (signInError.message.includes("Email not confirmed")) {
           throw new Error("Please verify your email address before logging in.");
      }
      throw new Error("Sign in failed. Please try again.");
    }

    if (!signInData || !signInData.session || !signInData.user) {
      throw new Error("Sign in failed: No session or user data returned.");
    }
    const { user, session } = signInData;

    let roleId: number | null = null;
    let providerId: string | null = null;

    try {
        // Fetch from public.users table
        const {  userProfile, error: profileError } = await supabase
            .from("users") // Assuming your public table is named 'users'
            .select("role_id") // Assuming 'role_id' column exists
            .eq("id", user.id) // Assuming 'id' in 'users' table is FK to auth.users.id
            .single();

        if (profileError && profileError.code !== "PGRST116") { // PGRST116: 0 rows
            console.error("Error fetching user profile after login:", profileError.message);
        } else if (userProfile) {
            roleId = userProfile.role_id;
        }

        // Get provider from auth user object
        providerId = user.app_metadata?.provider || user.identities?.[0]?.provider || null;

    } catch (e) {
         console.error("Error fetching user details post-login:", e);
    }

    return {
      user: user,
      session: session,
      roleId: roleId,
      providerId: providerId,
    };
  },

  /**
   * Get the current session
   */
  async getSession(): Promise<{ session: Session | null }> {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session:", error.message);
      throw error;
    }
    return { session: data.session };
  },

  /**
   * Check if user exists and is verified in public.users
   * This function should ideally be an API call to a backend endpoint for security.
   * For client-side, it can only check auth status, not custom 'verified' field securely.
   */
  async checkUserVerification(email: string): Promise<UserVerificationStatus> {
     console.warn("checkUserVerification client-side might be insecure for checking 'verified' field from 'users' table. This is a placeholder.");
     // This is a simplified check. Real verification status should come from your backend.
     const {  { user } } = await supabase.auth.getUser();
     if (user && user.email === email) {
        // Cannot securely check `public.users.verified` from client.
        // This only confirms the auth user exists.
        return { exists: true, verified: false }; // Assume not verified from client perspective
     }
     return { exists: false, verified: false };
  },

  /**
   * Reset Password
   */
  async resetPassword(email: string): Promise<void> {
    const redirectUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/reset-password`;
    console.log("Requesting password reset for", email, "with redirect to", redirectUrl);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) {
        console.error("Error sending password reset email:", error);
        throw new Error(error.message || "Failed to send password reset email.");
    }
  },

  /**
   * Update Password (when user is logged in and knows current hash, or via reset token)
   */
  async updatePasswordWithResetToken(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
        console.error("Error updating password:", error);
        throw new Error(error.message || "Failed to update password.");
    }
  },

  /**
   * Update User Metadata (user_metadata)
   */
  async updateUserMetadata(meta CustomUserMetadata) {
    // user_metadata is updated via the `data` property in UserAttributes
    const {  updateData, error } = await supabase.auth.updateUser({  metadata }); 
    if (error) {
        console.error("Error updating user metadata", error);
        throw new Error(error.message || "Failed to update user profile.");
    }
    if (!updateData || !updateData.user) {
        throw new Error("Failed to update user profile: No user data returned after update.");
    }
    return updateData.user;
  },

  /**
   * Get User Details (including role_id from public.users table)
   */
  async getUserDetails(): Promise<{ user: User | null; roleId: number | null; providerId: string | null }> {
     const {  authUserData, error: authUserError } = await supabase.auth.getUser();
     
     if (authUserError || !authUserData || !authUserData.user) {
         if(authUserError) console.error("Error getting auth user:", authUserError.message);
         return { user: null, roleId: null, providerId: null };
     }
     const authUser = authUserData.user;

     let roleId: number | null = null;
     try {
         const {  userProfile, error: profileError } = await supabase
             .from("users") // Assuming your public table is named 'users'
             .select("role_id") // Assuming 'role_id' column exists
             .eq("id", authUser.id) // Assuming 'id' in 'users' table is FK to auth.users.id
             .single();

         if (profileError && profileError.code !== "PGRST116") { // PGRST116: 0 rows
             console.error("Error fetching user details from public table:", profileError.message);
         } else if (userProfile) {
             roleId = userProfile.role_id;
         }
     } catch (e) {
         console.error("Exception fetching user details from public table:", e);
     }

     const providerId = authUser.app_metadata?.provider || authUser.identities?.[0]?.provider || null;

     return {
       user: authUser,
       roleId: roleId,
       providerId: providerId,
     };
  },

  /**
   * Sign Out
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      // Optionally re-throw or handle more gracefully
    }
  },
};

export default authService;
