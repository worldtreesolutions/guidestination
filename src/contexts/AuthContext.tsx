
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Session, User } from "@supabase/supabase-js"
import authService from "@/services/authService"

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{
    data: { user: User; session: Session } | null;
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const defaultContext: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  login: async () => ({ data: null, error: null }),
  signOut: async () => {},
  isAuthenticated: false,
}

const AuthContext = createContext<AuthContextType>(defaultContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      setLoading(false)
    }

    fetchSession()

    // Fix: Correctly destructure the subscription from onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await authService.signInWithEmail(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Login error:", error)
      return {
        data: null,
        error: error as Error,
      }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const value = {
    user,
    session,
    loading,
    login,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
