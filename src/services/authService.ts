import { supabase } from "@/integrations/supabase/client"
import { User, Session } from "@supabase/supabase-js"

export interface SignInResponse {
  user: User | null;
  session: Session | null;
  provider_id?: string;
  error: Error | null;
}

export interface SignUpResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

const authService = {
  async signInWithEmail(email: string, password: string): Promise<SignInResponse> {
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // If login successful, check if user is an activity owner and fetch provider_id
      let provider_id = undefined;
      if (data.user && supabase) {
        // Check if user is an activity owner
        const ownerResult = await supabase
          .from('activity_owners')
          .select('id')
          .eq('user_id', data.user.id)
          .single();

        if (!ownerResult.error && ownerResult.data) {
          provider_id = ownerResult.data.id;
          console.log("Found provider_id:", provider_id);
        }
      }

      return {
        user: data.user, 
        session: data.session,
        provider_id,
        error: null,
      }
    } catch (error) {
      console.error("Auth service signInWithEmail error:", error)
      return {
        user: null,
        session: null,
        error: error as Error,
      }
    }
  },

  async signOut() {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async signUp(email: string, password: string): Promise<SignUpResponse> {
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        return { user: null, session: null, error };
      }
      if (data.user && data.session) {
        return { user: data.user, session: data.session, error: null };
      }
      // If user or session is null, it's an unexpected state.
      return { user: null, session: null, error: new Error("User or session data is missing after sign up.") };
    } catch (error) {
      return { user: null, session: null, error: error as Error };
    }
  },

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    if (!supabase) {
      return { error: new Error("Supabase client not initialized") };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/reset-password`,
    })
    return { error: error ? error : null };
  },

  async updatePassword(password: string): Promise<{ error: Error | null }> {
    if (!supabase) {
      return { error: new Error("Supabase client not initialized") };
    }

    const { error } = await supabase.auth.updateUser({
      password,
    })
    return { error: error ? error : null };
  },

  async getActivityOwnerId(userId: string): Promise<string | null> {
    if (!supabase) {
      console.error("Supabase client not initialized");
      return null;
    }

    const result = await supabase
      .from("activity_owners")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (result.error) {
      console.error("Error fetching activity owner id:", result.error);
      return null;
    }
    return result.data?.id || null;
  },

  async getPartnerId(userId: string): Promise<string | null> {
    if (!supabase) {
      console.error("Supabase client not initialized");
      return null;
    }

    const result = await supabase
      .from("partner_registrations")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (result.error) {
      console.error("Error fetching partner id:", result.error);
      return null;
    }
    return result.data?.id || null;
  },
}

export default authService
