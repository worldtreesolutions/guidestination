import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import authService from "@/services/authService";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (currentUser: User | null) => {
    if (currentUser) {
      const userType = currentUser.user_metadata?.user_type;
      setIsAdmin(userType === "admin" || userType === "super_admin");
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { session: initialSession } = await supabase.auth.getSession(); // Corrected destructuring
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        await checkAdminRole(initialSession?.user ?? null);
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => { // Corrected subscription destructuring
      setSession(newSession);
      setUser(newSession?.user ?? null);
      await checkAdminRole(newSession?.user ?? null);
      if (_event !== "INITIAL_SESSION") { 
        setLoading(false);
      }
      if (_event === "INITIAL_SESSION" && loading) {
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe(); // Use the destructured subscription
    };
  }, [loading]); // Added loading to dependency array as it's used in an effect conditional

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: authedUser, session: authedSession, error } = await authService.signInWithEmail(email, password);
      if (error) {
        throw error;
      }
      setUser(authedUser);
      setSession(authedSession);
      await checkAdminRole(authedUser);
      return { user: authedUser, session: authedSession, error: null };
    } catch (error: any) {
      console.error("Error during sign in:", error);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      return { user: null, session: null, error };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signOut: handleSignOut,
    signInWithEmail: handleSignInWithEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}