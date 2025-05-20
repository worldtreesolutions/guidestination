
import { supabase } from "@/integrations/supabase/client"
import { User, Session } from "@supabase/supabase-js"

interface SignInResponse {
  data: {
    user: User;
    session: Session;
    provider_id?: string;
  } | null;
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
          .select('id')
          .eq('user_id', data.user.id)
          .single();

        if (!ownerError && ownerData) {
          provider_id = ownerData.id;
          console.log("Found provider_id:", provider_id);
        }
      }

      return {
        data: { 
          user: data.user, 
          session: data.session,
          provider_id 
        },
        error: null,
      }
    } catch (error) {
      console.error("Auth service signInWithEmail error:", error)
      return {
        data: null,
        error: error as Error,
      }
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/reset-password`,
    })
    if (error) throw error
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    })
    if (error) throw error
  },
}

export default authService
