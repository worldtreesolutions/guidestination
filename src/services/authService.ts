
import { supabase } from "@/integrations/supabase/client";
import { Session, User, UserAttributes } from "@supabase/supabase-js";

export interface CustomUserMetadata {
  name?: string;
  verified?: boolean;
  user_type?: string;
  phone?: string;
  [key: string]: any;
}

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
        const {  userProfile, error: profileError } = await supabase
            .from("users") 
            .select("role_id") 
            .eq("id", user.id) 
            .single();

        if (profileError && profileError.code !== "PGRST116") { 
            console.error("Error fetching user profile after login:", profileError.message);
        } else if (userProfile) {
            roleId = userProfile.role_id;
        }
        providerId = user.app_metadata?.provider || user.identities?.[0]?.provider || null;
    } catch (e) {
         console.error("Error fetching user details post-login:", e);
    }
    return { user, session, roleId, providerId };
  },

  async getSession(): Promise<{ session: Session | null }> {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session:", error.message);
      throw error;
    }
    return { session: data.session };
  },

  async checkUserVerification(email: string): Promise<UserVerificationStatus> {
     console.warn("checkUserVerification client-side might be insecure for checking 'verified' field from 'users' table. This is a placeholder.");
     const { data, error: getUserError } = await supabase.auth.getUser();
     if (getUserError) {
        console.error("Error getting user for verification check:", getUserError.message);
        return { exists: false, verified: false };
     }
     const user = data?.user;
     if (user && user.email === email) {
        return { exists: true, verified: false }; 
     }
     return { exists: false, verified: false };
  },

  async resetPassword(email: string): Promise<void> {
    const redirectUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) {
        console.error("Error sending password reset email:", error);
        throw new Error(error.message || "Failed to send password reset email.");
    }
  },

  async updatePasswordWithResetToken(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
        console.error("Error updating password:", error);
        throw new Error(error.message || "Failed to update password.");
    }
  },

  async updateUserMetadata(meta CustomUserMetadata): Promise<User> {
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
             .from("users") 
             .select("role_id") 
             .eq("id", authUser.id) 
             .single();

         if (profileError && profileError.code !== "PGRST116") { 
             console.error("Error fetching user details from public table:", profileError.message);
         } else if (userProfile) {
             roleId = userProfile.role_id;
         }
     } catch (e) {
         console.error("Exception fetching user details from public table:", e);
     }
     const providerId = authUser.app_metadata?.provider || authUser.identities?.[0]?.provider || null;
     return { user: authUser, roleId, providerId };
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  },
};

export default authService;
