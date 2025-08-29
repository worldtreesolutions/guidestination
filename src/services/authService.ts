
import { supabase } from "@/integrations/supabase/client"

const supabaseAny = supabase as any;

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
      if (!supabaseAny) {
        throw new Error("Supabase client not initialized");
      }

      const authResult = await supabaseAny.auth.signInWithPassword({
        email,
        password,
      })

      if (authResult.error) throw authResult.error

      // Verify user is a customer before allowing login
      if (authResult.data.user) {
        try {
          const customerQuery = await supabaseAny
            .from('customers')
            .select('id')
            .eq('user_id', authResult.data.user.id)
            .maybeSingle()

          if (!customerQuery.data) {
            // User is not a customer - sign them out and deny access
            await supabaseAny.auth.signOut()
            throw new Error("Access restricted to customers only")
          }
        } catch (customerErr) {
          // If customer check fails, sign out and deny access
          await supabaseAny.auth.signOut()
          if (customerErr instanceof Error && customerErr.message === "Access restricted to customers only") {
            throw customerErr
          }
          throw new Error("Unable to verify customer status")
        }
      }

      let provider_id: string | undefined = undefined;
      if (authResult.data.user) {
        try {
          const ownerQuery = await supabaseAny
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
    if (!supabaseAny) {
      throw new Error("Supabase client not initialized");
    }
    const { error } = await supabaseAny.auth.signOut()
    if (error) throw error
  },

  async signUp(email: string, password: string): Promise<SignUpResponse> {
    try {
      if (!supabaseAny) {
        throw new Error("Supabase client not initialized");
      }

      // Send a confirmation email that redirects back to our app
      // We intentionally avoid auto-login here; the callback will not create a session.
      const { data, error } = await supabaseAny.auth.signUp(
        { email, password },
        { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm-callback` : undefined }
      );
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
    if (!supabaseAny) {
      return { error: new Error("Supabase client not initialized") };
    }

    const { error } = await supabaseAny.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-callback`,
    })
    return { error: error ? error : null };
  },

  async updatePassword(password: string): Promise<{ error: Error | null }> {
    if (!supabaseAny) {
      return { error: new Error("Supabase client not initialized") };
    }

    const { error } = await supabaseAny.auth.updateUser({
      password,
    })
    return { error: error ? error : null };
  },

  async getActivityOwnerId(userId: string): Promise<string | null> {
    if (!supabaseAny) {
      console.error("Supabase client not initialized");
      return null;
    }

    try {
      const { data, error } = await supabaseAny
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
    if (!supabaseAny) {
      console.error("Supabase client not initialized");
      return null;
    }

    try {
      const { data, error } = await supabaseAny
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
  