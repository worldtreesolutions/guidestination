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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // If login successful, check if user is an activity owner and fetch provider_id
      let provider_id = undefined;
      if (data.user) {
        // Check if user is an activity owner
        const { data: ownerData, error: ownerError } = await supabase
          .from('activity_owners')
          .select('provider_id') // Changed from 'id' to 'provider_id'
          .eq('user_id', data.user.id)
          .single();

        if (!ownerError && ownerData) {
          provider_id = ownerData.provider_id; // Changed from ownerData.id to ownerData.provider_id
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
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async signUp(email: string, password: string): Promise<SignUpResponse> {
    try {
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/reset-password`,
    })
    return { error: error ? error : null };
  },

  async updatePassword(password: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.updateUser({
      password,
    })
    return { error: error ? error : null };
  },
}

export default authService
