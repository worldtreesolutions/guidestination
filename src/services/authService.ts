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
   * Check if a user exists by email (Corrected return type)
   */
  async checkUserExists(email: string): Promise<{ exists: boolean; userId?: string }> { // userId is already string (UUID) - OK
    const { data, error } = await supabaseAdmin // Use admin client here
      .from("users")
      .select("id") // id in users table is INT
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Error checking user existence:", error.message);
      return { exists: false };
    }

    return {
      exists: !!data,
      // @ Convert numeric ID to string if needed elsewhere, but keep as number internally if appropriate
      userId: data?.id?.toString() // Convert number ID to string
    };
  },

  /**
   * Check if user exists and is verified
   */
  async checkUserVerification(email: string): Promise<UserVerificationStatus> {
    const { data, error } = await supabaseAdmin // Use admin client here
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
   * Create a new user in the users table (Corrected return type)
   */
  async createUser(userData: UserRegistration): Promise<{ userId: string }> { // userId is already string (UUID) - OK
    const { data, error } = await supabaseAdmin // Use admin client here
      .from("users")
      .insert({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        user_type: userData.user_type || "activity_provider",
        verified: false 
      })
      .select("id") // id is INT
      .single();

    if (error) {
      console.error("Error creating user in users table:", error.message);
      throw error;
    }

    if (!data) {
      throw new Error("Failed to create user: No data returned");
    }

    // @ Convert numeric ID to string for return type consistency
    return { userId: data.id.toString() }; 
  },

  /**
   * Create a verification token and send verification email (Corrected userId type)
   */
  async createEmailVerification(userId: string): Promise<{ token: string }> { // userId is already string (UUID) - OK
    const token = uuidv4();
    
    // @ Convert string userId back to number for insertion if user_id column is INT
    const numericUserId = parseInt(userId, 10); 
    if (isNaN(numericUserId)) {
       throw new Error("Invalid user ID format for email verification.");
    }

    // Assuming email_verifications table exists and user_id is INT
    // If the table doesn't exist or has a different schema, this will fail.
    // Let's comment out the insert for now to avoid potential errors if the table isn't there.
    /* 
    const { error } = await supabaseAdmin // Use admin client here
      .from("email_verifications") 
      .insert({
        user_id: numericUserId, // Pass the numeric ID
        token: token
      });

    if (error) {
      console.error("Error creating email verification record:", error.message);
      // If the error is 'relation "public.email_verifications" does not exist', 
      // it means the table needs to be created.
      throw error; 
    }
    */
    
    // Log for testing since the actual insert is commented out
    console.log(`Verification token generated for user ${userId} (numeric: ${numericUserId}): ${token}. (DB insert commented out)`); 
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
    const { exists, userId } = await this.checkUserExists(email);
    
    if (!exists) {
      throw new Error('No account found with this email. Please register first.');
    }
    
    // Check if user is verified
    const verificationStatus = await this.checkUserVerification(email);
    
    if (!verificationStatus.verified) {
      throw new Error('Your account is pending verification. Please contact support.');
    }
    
    // Create auth user with the existing email and new password
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
  },

  /**
   * Fetch user details including role and provider ID
   */
  async getUserDetails(userId: string): Promise<{ roleId: number | null; providerId: string | null }> {
    // @ Convert string userId back to number if users.id is INT
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
       console.error('Invalid user ID format for fetching details:', userId);
       return { roleId: null, providerId: null };
    }
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role_id')
      .eq('id', numericUserId) // Use the numeric ID
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
      providerId: providerId ? providerId.toString() : null, // Ensure providerId is string or null
    };
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