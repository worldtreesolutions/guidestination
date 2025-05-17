
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  AuthResponse,
  AuthError,
  User,
  Session,
  Provider,
} from "@supabase/supabase-js";

export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

const authService = {
  async signUp(
    email: string,
    password: string,
    additionalData?: Record<string, any>
  ): Promise<AuthResponse> {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
         additionalData, // Supabase expects additionalData directly, not nested under options.data
      },
    });
    return response;
  },

  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signInWithProvider(provider: Provider): Promise<AuthResponse> {
    const {  oauthFlowData, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (oauthError) {
      return {  { user: null, session: null }, error: oauthError };
    }
    // If no error, a redirect is expected. User/session will be available after redirect.
    // oauthFlowData contains { provider, url } which is not part of AuthResponse.data
    // We return a structure that matches AuthResponse, indicating no immediate user/session.
    return {  { user: null, session: null }, error: null };
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    return supabase.auth.signOut();
  },

  async getUser(): Promise<User | null> {
    const {  { user } } = await supabase.auth.getUser(); // Corrected destructuring
    return user;
  },

  async getSession(): Promise<Session | null> {
    const {  { session } } = await supabase.auth.getSession(); // Corrected destructuring
    return session;
  },

  async resetPasswordForEmail(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/reset-password`,
    });
    return { error };
  },

  async updateUserPassword(password: string): Promise<AuthResponse> {
    return supabase.auth.updateUser({ password });
  },

  async updateUserEmail(email: string): Promise<AuthResponse> {
    return supabase.auth.updateUser({ email });
  },

  async updateUserMetadata(meta Record<string, any>): Promise<AuthResponse> { // Corrected parameter syntax
    return supabase.auth.updateUser({  metadata }); // Corrected to use 'data' for user_metadata
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    return data;
  },

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }
    return data;
  },

  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async deleteUserAccount(userId: string): Promise<{ error: AuthError | null }> {
    console.warn(
      "Direct client-side user deletion is not recommended or might be restricted by RLS."
    );
    return {
      error: {
        name: "NotImplementedError",
        message: "User deletion from client-side is not fully implemented.",
        status: 501,
      } as AuthError,
    };
  },
};

export default authService;
