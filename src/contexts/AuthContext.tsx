import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Session, User } from "@supabase/supabase-js"
import authService, { SignInResponse } from "@/services/authService"

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<SignInResponse>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  provider_id?: string;
}

const defaultContext: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  login: async () => ({ user: null, session: null, error: new Error("Login function not implemented") }),
  signOut: async () => {},
  isAuthenticated: false,
  provider_id: undefined
}

const AuthContext = createContext<AuthContextType>(defaultContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [provider_id, setProviderId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      
      // If user exists, check for provider_id
      if (initialSession?.user) {
        const { data: ownerData } = await supabase
          .from('activity_owners')
          .select('provider_id')  // Changed from 'id' to 'provider_id'
          .eq('user_id', initialSession.user.id)
          .single();
          
        if (ownerData) {
          setProviderId(ownerData.provider_id);  // Changed from ownerData.id to ownerData.provider_id
        }
      }
      
      setLoading(false)
    }

    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        
        // If user exists, check for provider_id
        if (newSession?.user) {
          const { data: ownerData } = await supabase
            .from('activity_owners')
            .select('provider_id')  // Changed from 'id' to 'provider_id'
            .eq('user_id', newSession.user.id)
            .single();
            
          if (ownerData) {
            setProviderId(ownerData.provider_id);  // Changed from ownerData.id to ownerData.provider_id
          } else {
            setProviderId(undefined);
          }
        } else {
          setProviderId(undefined);
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<SignInResponse> => {
    try {
      const response = await authService.signInWithEmail(email, password)
      if (response.error) throw response.error
      
      // Set provider_id if available
      if (response.provider_id) {
        setProviderId(response.provider_id);
      }
      
      return response;
    } catch (error) {
      console.error("Login error:", error)
      return {
        user: null,
        session: null,
        error: error as Error,
      }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProviderId(undefined)
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
    provider_id
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
