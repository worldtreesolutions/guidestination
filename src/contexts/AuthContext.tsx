
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Session, User } from "@supabase/supabase-js"

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
  login: async () => ({ error: null })
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
      login
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
