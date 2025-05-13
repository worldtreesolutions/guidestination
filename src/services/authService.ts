import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/admin";
import { v4 as uuidv4 } from "uuid";
import { Session, User } from "@supabase/supabase-js";

// Define a type for user metadata
export interface UserMetadata {
  name?: string;
  verified?: boolean;
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
    // Corrected destructuring: use 'data' which contains user and session
    const { signInResponse, error: signInError } = await supabase.auth.signInWithPassword({
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

    // Access user and session from signInResponse
    if (!signInResponse || !signInResponse.session || !signInResponse.user) {
      throw new Error("Sign in failed. Please try again.");
    }
    const { user, session } = signInResponse;

    let roleId: number | null = null;
    let providerId: string | null = null;

    try {
        // Corrected destructuring for userProfile
        const { userProfile, error: profileError } = await supabase
            .from("users")
            .select("role_id")
            .eq("user_id", user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found, which is not an error here
            console.error("Error fetching user profile after login:", profileError.message);
        } else if (userProfile) {
            roleId = userProfile.role_id;
        }

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
   */
  async checkUserVerification(email: string): Promise<UserVerificationStatus> {
     console.warn("checkUserVerification client-side might be insecure or unnecessary and is not implemented in this service.");
     return { exists: false, verified: false }; // Placeholder
  },

  /**
   * Reset Password
   */
  async resetPassword(email: string): Promise<void> {
    const redirectUrl = `${typeof window !== "undefined" ? window.location.origin : ''}/dashboard/reset-password`;
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
   * Update Password with Reset Token
   */
  async updatePasswordWithResetToken(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
        console.error("Error updating password:", error);
        throw new Error(error.message || "Failed to update password.");
    }
  },

  /**
   * Update User Metadata
   */
  async updateUserMetadata(meta: UserMetadata) {
    // Corrected destructuring for updateUser
    const { updateResponse, error } = await supabase.auth.updateUser({ meta }); // user_metadata is passed via 'data' option for client updateUser
    if (error) {
        console.error("Error updating user meta", error);
        throw new Error(error.message || "Failed to update user profile.");
    }
    return updateResponse.user;
  },

  /**
   * Get User Details
   */
  async getUserDetails(): Promise<{ roleId: number | null; providerId: string | null }> {
     // Corrected destructuring for getUser
     const { authUserResponse, error: authUserError } = await supabase.auth.getUser();
     if (authUserError || !authUserResponse || !authUserResponse.user) {
         if(authUserError) console.error("Error getting auth user:", authUserError);
         return { roleId: null, providerId: null };
     }
     const authUser = authUserResponse.user;

     let roleId: number | null = null;
     try {
         // Corrected destructuring for userProfile
         const { userProfile, error: profileError } = await supabase
             .from("users")
             .select("role_id")
             .eq("user_id", authUser.id)
             .single();

         if (profileError && profileError.code !== 'PGRST116') {
             console.error("Error fetching user details:", profileError.message);
         } else if (userProfile) {
             roleId = userProfile.role_id;
         }
     } catch (e) {
         console.error("Error fetching user details:", e);
     }

     const providerId = authUser.app_metadata?.provider || authUser.identities?.[0]?.provider || null;

     return {
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
    }
  },
};

export default authService;