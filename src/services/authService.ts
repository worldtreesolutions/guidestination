import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface UserRegistration {
  name: string;
  email: string;
  phone?: string;
  user_type?: string;
}

export const authService = {
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
  }
};

export default authService;