import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Session, User } from "@supabase/supabase-js"
import customerService from "@/services/customerService"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  login: (email: string, password: string) => Promise<{ error: any }>
  ensureCustomerRecords: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  login: async () => ({ error: null }),
  ensureCustomerRecords: async () => {}
})

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting initial session:", error)
        }
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error in getInitialSession:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })
      
      if (error) {
        console.error("Sign in error:", error)
        return { error }
      }

      console.log("Sign in successful:", data.user?.email)
      return { error: null }
    } catch (error) {
      console.error("Sign in catch error:", error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const login = signIn // Alias for backward compatibility

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: metadata
        }
      })
      
      if (error) {
        console.error("Sign up error:", error)
        return { error }
      }

      // If user was created successfully, create customer record only
      if (data.user && !error) {
        try {
          const fullName = `${metadata?.first_name || ''} ${metadata?.last_name || ''}`.trim();
          
          // Create customer record only
          await customerService.createCustomer({
            cus_id: data.user.id,
            email: data.user.email || email.trim(),
            full_name: fullName || 'New User',
            phone: metadata?.phone || null,
            is_active: true
          });
          console.log("Customer record created successfully for:", data.user.email);
        } catch (customerError) {
          console.error("Error creating customer record:", customerError);
          // Don't return this error as the auth signup was successful
          // The customer record can be created later if needed
        }
      }

      console.log("Sign up successful:", data.user?.email)
      return { error: null }
    } catch (error) {
      console.error("Sign up catch error:", error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      }
      return { error }
    } catch (error) {
      console.error("Sign out catch error:", error)
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) {
        console.error("Reset password error:", error)
      }
      return { error }
    } catch (error) {
      console.error("Reset password catch error:", error)
      return { error }
    }
  }

  const ensureCustomerRecords = async () => {
    if (!user) return;
    
    try {
      const userMetadata = user.user_metadata || {};
      const fullName = `${userMetadata.first_name || ''} ${userMetadata.last_name || ''}`.trim();
      
      // Check if customer exists, create if not
      const supabaseAny = supabase as any;
      const { data: existingCustomer } = await supabaseAny
        .from("customers")
        .select("*")
        .eq("cus_id", user.id)
        .single();

      if (!existingCustomer) {
        await customerService.createCustomer({
          cus_id: user.id,
          email: user.email || '',
          full_name: fullName || 'User',
          phone: userMetadata.phone || null,
          is_active: true
        });
      }
    } catch (error) {
      console.error("Error ensuring customer records:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isAuthenticated,
      signIn, 
      signUp, 
      signOut, 
      resetPassword,
      login,
      ensureCustomerRecords
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
