
import { supabase } from "@/integrations/supabase/client"
import { User, Session } from "@supabase/supabase-js"

interface SignInResponse {
  data: {
    user: User;
    session: Session;
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

      return {
        data: data as { user: User; session: Session },
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
