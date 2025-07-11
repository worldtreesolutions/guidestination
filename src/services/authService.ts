
import { supabase } from "@/integrations/supabase/client"

export interface SignInResponse {
  user: any | null;
  session: any | null;
  provider_id?: string;
  error: Error | null;
}

export interface SignUpResponse {
  user: any | null;
  session: any | null;
  error: Error | null;
}

const authService = {
  async signInWithEmail(email: string, password: string): Promise<SignInResponse> {
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      const authResult = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authResult.error) throw authResult.error

      let provider_id: string | undefined = undefined;
      if (authResult.data.user) {
        try {
          const ownerQuery: any = await supabase
            .from('activity_owners')
            .select('provider_id')
            .eq('user_id', authResult.data.user.id)
            .maybeSingle()

          if (ownerQuery && !ownerQuery.error && ownerQuery.data) {
            provider_id = ownerQuery.data.provider_id;
            console.log("Found provider_id:", provider_id);
          }
        } catch (ownerErr) {
          console.log("User is not an activity owner");
        }
      }

      return {
        user: authResult.data.user, 
        session: authResult.data.session,
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

    try {
      const { data, error }: any = await supabase
        .from("activity_owners")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching activity owner id:", error);
        return null;
      }
      return data?.id || null;
    } catch (err) {
      console.error("Error in getActivityOwnerId:", err);
      return null;
    }
  },

  async getPartnerId(userId: string): Promise<string | null> {
    if (!supabase) {
      console.error("Supabase client not initialized");
      return null;
    }

    try {
      const { data, error }: any = await supabase
        .from("partner_registrations")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching partner id:", error);
        return null;
      }
      return data?.id || null;
    } catch (err) {
      console.error("Error in getPartnerId:", err);
      return null;
    }
  },
}

export default authService
