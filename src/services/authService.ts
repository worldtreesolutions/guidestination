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
   * Check if a user exists by email
   */
  async checkUserExists(email: string): Promise<{ exists: boolean; userId?: number }> {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return {
      exists: !!data,
      userId: data?.id
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
      return { exists: false, verified: false };
    }
    
    return { 
      exists: true, 
      verified: data?.verified === true 
    };
  },

  /**
   * Create a new user in the users table
   */
  async createUser(userData: UserRegistration): Promise<{ userId: number }> {
    // Create a new user with verified set to FALSE
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
      throw error;
    }

    if (!data) {
      throw new Error("Failed to create user: No data returned");
    }

    return { userId: data.id };
  },

  /**
   * Create a verification token and send verification email
   */
  async createEmailVerification(userId: number): Promise<{ token: string }> {
    // Generate a unique verification token
    const token = uuidv4();

    // Insert into email_verifications table
    const { error } = await supabase
      .from("email_verifications")
      .insert({
        user_id: userId,
        token: token
      });

    if (error) {
      throw error;
    }
    
    // In a real application, you would send an email with the verification link here
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
};

export default authService;