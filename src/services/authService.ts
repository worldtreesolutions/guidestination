
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
         additionalData,
      },
    });
    return response;
  },

  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    // Directly return the Supabase auth response
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signInWithProvider(provider: Provider): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    // signInWithOAuth doesn't directly return a session/user in the same way as password auth
    // It navigates the user. The session is established upon redirect.
    // So, we construct a compatible AuthResponse shape.
    // If there's an error, it will be in the 'error' object.
    // If successful, 'data' will contain the provider link, but not user/session immediately.
    return {  { user: null, session: null, ...data }, error } as AuthResponse;
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    return supabase.auth.signOut();
  },

  async getUser(): Promise<User | null> {
    const {
       { user },
    } = await supabase.auth.getUser();
    return user;
  },

  async getSession(): Promise<Session | null> {
    const {
       { session },
    } = await supabase.auth.getSession();
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

  async updateUserMetadata(meta Record<string, any>): Promise<AuthResponse> {
    return supabase.auth.updateUser({  metadata });
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
    // This typically needs to be an admin operation.
    // If you have a Supabase Edge Function for this:
    // const { error } = await supabase.functions.invoke('delete-user', {
    //   body: { userId },
    // })
    // return { error };

    // Placeholder if direct client-side deletion is not set up or allowed
    console.warn(
      "Direct client-side user deletion is not recommended or might be restricted by RLS."
    );
    // For now, let's assume this is handled by an admin or a secure function.
    // If you intend for users to delete their own accounts from the client,
    // ensure RLS policies on auth.users allow this, which is generally not default.
    // A common pattern is to call a server-side function.
    // This is a simplified example and might not work without proper backend setup.
    // const { error } = await supabase.rpc('delete_user_account'); // Example of calling a pg function
    // return { error };
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
