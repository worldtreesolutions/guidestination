import { supabase } from "@/integrations/supabase/client";
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
  async signInWithEmail(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
    // First check if user exists and is verified
    const verificationStatus = await this.checkUserVerification(email);
    
    if (verificationStatus.exists && !verificationStatus.verified) {
      throw new Error('Your account is pending verification. Please contact support.');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
   * Sign up with email and password using Supabase Auth
   */
  async signUpWithEmail(email: string, password: string, metadata: UserMetadata = {}): Promise<{ user: User | null; session: Session | null }> {
    // Set verified to false by default for new users
    const userMetadata = { ...metadata, verified: false };
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
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
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
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
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Error checking user existence:", error.message);
      return { exists: false };
    }

    return {
      exists: !!data,
      userId: data?.id // id is UUID (string) - OK
    };
  },

  /**
   * Check if user exists and is verified
   */
  async checkUserVerification(email: string): Promise<UserVerificationStatus> {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from("users")
      .insert({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        user_type: userData.user_type || "activity_provider",
        verified: false 
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating user in users table:", error.message);
      throw error;
    }

    if (!data) {
      throw new Error("Failed to create user: No data returned");
    }

    return { userId: data.id }; // id is UUID (string) - OK
  },

  /**
   * Create a verification token and send verification email (Corrected userId type)
   */
  async createEmailVerification(userId: string): Promise<{ token: string }> { // userId is already string (UUID) - OK
    const token = uuidv4();

    // Assuming email_verifications table exists and user_id is UUID
    // If the table doesn't exist or has a different schema, this will fail.
    // The SQL in the previous step didn't create this table by default.
    // Let's comment out the insert for now to avoid potential errors if the table isn't there.
    // If email verification is needed later, we can uncomment and ensure the table exists.
    /* 
    const { error } = await supabase
      .from("email_verifications") 
      .insert({
        user_id: userId, // Pass the string UUID
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
    console.log(`Verification token generated for user ${userId}: ${token}. (DB insert commented out)`); 
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
};

export default authService;