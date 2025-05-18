
import { supabase } from "@/integrations/supabase/client";
import {
  AuthResponse,
  AuthError,
  User,
  Session,
  Provider,
  OAuthResponse
} from "@supabase/supabase-js";

export interface UserProfile {
  id: number;
  user_id: string;
  name: string;
  email: string;
  password_hash: string | null;
  phone: string | null;
  user_type: string | null;
  created_at: string | null;
  role_id: number | null;
  verified: boolean;
  avatar_url?: string;
  updated_at?: string;
}

const authService = {
  async signUp(
    email: string,
    password: string,
    additionalData?: Record<string, any>
  ): Promise<AuthResponse> {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: additionalData,
      },
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signInWithProvider(provider: Provider): Promise<OAuthResponse> {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
      },
    });
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    return supabase.auth.signOut();
  },

  async getUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async resetPasswordForEmail(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/reset-password`,
    });
    return { error };
  },

  async updatePasswordWithResetToken(password: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  },

  async updateUserPassword(password: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  },

  async updateUserEmail(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({ email });
    return { error };
  },

  async updateUserMetadata(metadata: Record<string, any>): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({ data: metadata });
    return { error };
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      user_id: data.user_id || userId, // Ensure user_id is always present
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      phone: data.phone,
      user_type: data.user_type,
      created_at: data.created_at,
      role_id: data.role_id,
      verified: data.verified,
      avatar_url: data.avatar_url,
      updated_at: data.updated_at
    };
  },

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      user_id: data.user_id || userId, // Ensure user_id is always present
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      phone: data.phone,
      user_type: data.user_type,
      created_at: data.created_at,
      role_id: data.role_id,
      verified: data.verified,
      avatar_url: data.avatar_url,
      updated_at: data.updated_at
    };
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
