
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
    // Check if user exists in the custom 'users' table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, verified, role_id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data or user not found:', userError?.message);
      throw new Error('User not found in our system.');
    }

    // Check if the user is verified
    if (!userData.verified) {
      throw new Error('Account not verified. Please check your email or contact support.');
    }

    // Attempt Supabase sign-in
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Supabase sign-in error:', signInError.message);
      // Provide a more generic error message for security
      throw new Error('Invalid login credentials.');
    }

    if (!data.session || !data.user) {
      throw new Error('Sign in failed. Please try again.');
    }

    return {
      user: data.user,
      session: data.session,
      roleId: userData.role_id, // Return role_id
      providerId: data.user.app_metadata?.provider_id?.toString(), // Ensure providerId is string
    };
  },

  /**
   * Get the current session
   */
  async getSession(): Promise<{ session: Session | null }> {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    return {
      session: data.session,
    };
  },

  /**
   * Check if a user exists by email
   * This checks both auth.users and public.users tables
   */
  async checkUserExists(email: string): Promise<{ exists: boolean; userId?: string; authUserId?: string }> {
    // First check in auth.users table
    const { data: authData, error: authError } = await supabaseAdmin
      .from("auth.users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    
    if (authError && authError.code !== 'PGRST116') {
      console.error("Error checking user existence in auth.users:", authError.message);
    }
    
    // Then check in public.users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userError && userError.code !== 'PGRST116') {
      console.error("Error checking user existence in users table:", userError.message);
    }

    const authUserExists = !!authData;
    const appUserExists = !!userData;
    
    return {
      exists: authUserExists || appUserExists,
      userId: userData?.id?.toString(), // ID from users table (might be numeric)
      authUserId: authData?.id // UUID from auth.users table
    };
  },

  /**
   * Check if user exists and is verified
   */
  async checkUserVerification(email: string): Promise<UserVerificationStatus> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, verified')
      .eq('email', email)
      .single();
    
    if (error) {
      // If error (e.g., user not found), return false for both
      // Avoid logging "No rows found" as an error here, it's expected if user doesn't exist
      if (error.code !== 'PGRST116') { 
         console.error("Error checking user verification:", error.message);
      }
      return { exists: false, verified: false };
    }
    
    return { 
      exists: true, 
      verified: data?.verified === true 
    };
  },

  /**
   * Create a new user in both auth.users and public.users tables
   * This ensures the user_id in activity_owners can reference the auth.users UUID
   */
  async createUser(userData: UserRegistration): Promise<{ userId: string }> {
    console.log("Creating new user with data:", { ...userData, password: userData.password ? "***" : undefined });
    
    try {
      // Generate a temporary password if none provided
      const tempPassword = userData.password || `temp-${uuidv4().substring(0, 8)}`;
      
      // Step 1: Create user in auth.users table first to get the UUID
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email to avoid verification issues
        user_metadata: {
          name: userData.name,
          phone: userData.phone,
          user_type: userData.user_type || "activity_provider"
        }
      });

      if (authError) {
        console.error("Error creating user in auth.users:", authError);
        throw authError;
      }

      if (!authUser || !authUser.user || !authUser.user.id) {
        throw new Error("Failed to create auth user: No user ID returned");
      }

      const authUserId = authUser.user.id; // This is a UUID
      console.log("Created auth user with UUID:", authUserId);

      // Step 2: Create corresponding entry in public.users table with reference to auth user
      const { data: userData, error: userError } = await supabaseAdmin
        .from("users")
        .insert({
          auth_user_id: authUserId, // Store the auth.users UUID
          name: userData.name,
          email: userData.email,
          phone: userData.phone || null,
          user_type: userData.user_type || "activity_provider",
          verified: false
        })
        .select("id")
        .single();

      if (userError) {
        console.error("Error creating user in users table:", userError);
        // If we fail here, we should try to clean up the auth user we created
        try {
          await supabaseAdmin.auth.admin.deleteUser(authUserId);
        } catch (cleanupError) {
          console.error("Failed to clean up auth user after error:", cleanupError);
        }
        throw userError;
      }

      console.log("Created app user with ID:", userData?.id);
      
      // Return the auth user UUID, which is what we'll use for activity_owners.user_id
      return { userId: authUserId };
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  },

  /**
   * Create a verification token and send verification email
   */
  async createEmailVerification(userId: string): Promise<{ token: string }> {
    const token = uuidv4();
    
    // Log for testing
    console.log(`Verification token generated for user ${userId}: ${token}`);
    
    // Here we would typically send an email with the verification token
    // For now, we'll just return the token
    return { token };
  },

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/reset-password`,
    });

    if (error) {
      throw error;
    }
  },

  /**
   * Update password with reset token
   */
  async updatePasswordWithResetToken(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
  },

  /**
   * Update user metadata
   */
  async updateUserMetadata(metadata: UserMetadata) {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });
    
    if (error) throw error;
    return data.user;
  },

  /**
   * Set up password for existing user
   * This is used when a user has been registered as an activity provider
   * but hasn't set up their password yet
   */
  async setupPasswordForExistingUser(email: string, password: string, name: string): Promise<{ user: User | null; session: Session | null }> {
    // First check if user exists
    const { exists, authUserId } = await this.checkUserExists(email);
    
    if (!exists) {
      throw new Error('No account found with this email. Please register first.');
    }
    
    // Check if user is verified
    const verificationStatus = await this.checkUserVerification(email);
    
    if (!verificationStatus.verified) {
      throw new Error('Your account is pending verification. Please contact support.');
    }
    
    // Update the existing auth user with the new password
    if (authUserId) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        authUserId,
        { password }
      );
      
      if (error) {
        throw error;
      }
      
      // Sign in the user with the new credentials
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        throw signInError;
      }
      
      return {
        user: data.user,
        session: data.session,
      };
    } else {
      // If no auth user exists yet, create one
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, verified: true },
        },
      });

      if (error) {
        throw error;
      }

      return {
        user: data.user,
        session: data.session,
      };
    }
  },

  /**
   * Fetch user details including role and provider ID
   */
  async getUserDetails(userId: string): Promise<{ roleId: number | null; providerId: string | null }> {
    // First try to find user by auth.users UUID
    const { data: authUserData, error: authUserError } = await supabaseAdmin
      .from('users')
      .select('role_id')
      .eq('auth_user_id', userId)
      .single();
    
    if (!authUserError && authUserData) {
      // Found user by auth_user_id
      const { data: { user } } = await supabase.auth.getUser();
      const providerId = user?.app_metadata?.provider_id ?? null;
      
      return {
        roleId: authUserData?.role_id ?? null,
        providerId: providerId ? providerId.toString() : null,
      };
    }
    
    // If not found by UUID, try by numeric ID (legacy support)
    const numericUserId = parseInt(userId, 10);
    if (!isNaN(numericUserId)) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('role_id')
        .eq('id', numericUserId)
        .single();

      if (error) {
        console.error('Error fetching user details:', error);
        return { roleId: null, providerId: null };
      }

      // Fetch provider ID from auth metadata
      const { data: { user } } = await supabase.auth.getUser();
      const providerId = user?.app_metadata?.provider_id ?? null;

      return {
        roleId: data?.role_id ?? null,
        providerId: providerId ? providerId.toString() : null,
      };
    }
    
    return { roleId: null, providerId: null };
  },

  /**
   * Sign out the user
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },
};

export default authService;
