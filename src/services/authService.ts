
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
    const {  userRecord, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, verified, role_id')
      .eq('email', email)
      .single();

    if (userError || !userRecord) {
      console.error('Error fetching user data or user not found:', userError?.message);
      throw new Error('User not found in our system.');
    }

    if (!userRecord.verified) {
      throw new Error('Account not verified. Please check your email or contact support.');
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Supabase sign-in error:', signInError.message);
      throw new Error('Invalid login credentials.');
    }

    if (!data.session || !data.user) {
      throw new Error('Sign in failed. Please try again.');
    }

    return {
      user: data.user,
      session: data.session,
      roleId: userRecord.role_id,
      providerId: data.user.app_metadata?.provider_id?.toString(),
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
    return { session: data.session };
  },

  /**
   * Check if a user exists by email
   * This checks both auth.users (via admin API) and public.users tables
   */
  async checkUserExists(email: string): Promise<{ exists: boolean; userId?: string; authUserId?: string }> {
    let authUserExists = false;
    let authUserApiId: string | undefined = undefined;

    // Check in auth.users table using the admin API
    const {  authUsersData, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();


    if (authUsersError) {
      console.error("Error listing users from auth.users:", authUsersError.message);
    } else if (authUsersData && authUsersData.users) {
        const foundUser = authUsersData.users.find(user => user.email === email);
        if (foundUser) {
            authUserExists = true;
            authUserApiId = foundUser.id;
        }
    }
    
    // Check in public.users table
    const {  publicUserData, error: publicUserError } = await supabaseAdmin
      .from("users")
      .select("id, user_id") // Assuming 'user_id' in public.users stores the auth.users UUID
      .eq("email", email)
      .maybeSingle();

    if (publicUserError && publicUserError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
      console.error("Error checking user existence in public.users table:", publicUserError.message);
    }

    const appUserExists = !!publicUserData;
    const appUserAuthForeignKey = publicUserData?.user_id; // UUID from public.users.user_id

    // Consolidate findings
    const finalAuthUserId = authUserApiId || appUserAuthForeignKey;
    
    return {
      exists: authUserExists || appUserExists,
      userId: publicUserData?.id?.toString(), // This is the public.users.id (integer PK)
      authUserId: finalAuthUserId // This is the auth.users.id (UUID)
    };
  },

  /**
   * Check if user exists and is verified in public.users
   */
  async checkUserVerification(email: string): Promise<UserVerificationStatus> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, verified')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { 
         console.error("Error checking user verification:", error.message);
      }
      return { exists: false, verified: false };
    }
    return { exists: true, verified: data?.verified === true };
  },

  /**
   * Create a new user in both auth.users and public.users tables
   */
  async createUser(userRegistrationData: UserRegistration): Promise<{ userId: string }> { 
    console.log("Creating new user with ", { ...userRegistrationData, password: userRegistrationData.password ? "***" : undefined });
    
    try {
      const tempPassword = userRegistrationData.password || `temp-${uuidv4().substring(0, 8)}`;
      
      const {  authUserResponse, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userRegistrationData.email,
        password: tempPassword,
        email_confirm: true,
        user_meta { // Corrected: This should be user_metadata
          name: userRegistrationData.name,
          phone: userRegistrationData.phone,
          user_type: userRegistrationData.user_type || "activity_provider"
        }
      });

      if (authError) {
        console.error("Error creating user in auth.users:", authError);
        throw authError;
      }

      if (!authUserResponse || !authUserResponse.user || !authUserResponse.user.id) {
        throw new Error("Failed to create auth user: No user ID returned");
      }

      const authUserId = authUserResponse.user.id;
      console.log("Created auth user with UUID:", authUserId);

      const {  publicUserInsertData, error: publicUserInsertError } = await supabaseAdmin
        .from("users")
        .insert({
          user_id: authUserId, 
          name: userRegistrationData.name,
          email: userRegistrationData.email,
          phone: userRegistrationData.phone || null,
          user_type: userRegistrationData.user_type || "activity_provider",
          verified: false 
        })
        .select("id")
        .single();

      if (publicUserInsertError) {
        console.error("Error creating user in public.users table:", publicUserInsertError);
        try {
          await supabaseAdmin.auth.admin.deleteUser(authUserId);
        } catch (cleanupError) {
          console.error("Failed to clean up auth user after error:", cleanupError);
        }
        throw publicUserInsertError;
      }

      console.log("Created public.users app user with ID:", publicUserInsertData?.id);
      return { userId: authUserId }; 
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error; 
    }
  },

  async createEmailVerification(userId: string): Promise<{ token: string }> {
    const token = uuidv4();
    console.log(`Verification token generated for user ${userId}: ${token}`);
    return { token };
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ''}/dashboard/reset-password`,
    });
    if (error) throw error;
  },

  async updatePasswordWithResetToken(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async updateUserMetadata(meta UserMetadata) { // Corrected: parameter definition
    const { data, error } = await supabase.auth.updateUser({  metadata }); // Corrected: pass metadata under 'data'
    if (error) throw error;
    return data.user;
  },

  async setupPasswordForExistingUser(email: string, password: string, name: string): Promise<{ user: User | null; session: Session | null }> {
    const { exists, authUserId } = await this.checkUserExists(email);
    if (!exists) throw new Error('No account found with this email. Please register first.');
    
    const verificationStatus = await this.checkUserVerification(email);
    if (!verificationStatus.verified) throw new Error('Your account is pending verification. Please contact support.');
    
    if (authUserId) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });
      if (error) throw error;
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      return { user: data.user, session: data.session };
    } else {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: {  { name, verified: true } } // Corrected: pass options.data
      }); 
      if (error) throw error;
      return { user: data.user, session: data.session };
    }
  },

  async getUserDetails(authUuid: string): Promise<{ roleId: number | null; providerId: string | null }> {
    const {  userRecord, error } = await supabaseAdmin
      .from('users')
      .select('role_id') 
      .eq('user_id', authUuid) 
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user details from public.users:', error);
      return { roleId: null, providerId: null };
    }
    
    if (!userRecord) {
        return { roleId: null, providerId: null };
    }
    
    let providerIdString: string | null = null;
    try {
        const {  { user: authUser } } = await supabase.auth.getUser(); 
        if (authUser && authUser.app_metadata && authUser.app_metadata.provider_id) {
            providerIdString = authUser.app_metadata.provider_id.toString();
        }
    } catch (e) {
        console.error("Error getting current auth user for providerId:", e);
    }

    return {
      roleId: userRecord?.role_id ?? null,
      providerId: providerIdString, 
    };
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },
};

export default authService;
