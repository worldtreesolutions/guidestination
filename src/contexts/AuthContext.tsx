
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
  // Add other auth methods if they are part of the context, e.g., signUp
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
      // Check user_metadata for role.
      // This metadata should be set during user registration or by an admin.
      const userType = currentUser.user_metadata?.user_type;
      // console.log("Current user_metadata for isAdmin check:", currentUser.user_metadata);
      setIsAdmin(userType === "admin" || userType === "super_admin");
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {  { session: initialSession } } = await supabase.auth.getSession();
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

    const {  authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      await checkAdminRole(newSession?.user ?? null);
      // Avoid redundant loading set on initial check if INITIAL_SESSION event also triggers this
      if (_event !== "INITIAL_SESSION") { 
        setLoading(false);
      }
      // If it's the initial session event, loading might have already been set by getInitialSession
      if (_event === "INITIAL_SESSION" && loading) {
        setLoading(false);
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps 
  // Added eslint-disable for exhaustive-deps as checkAdminRole is stable if not dependent on external state changing frequently

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Error during sign out:", error);
      // Handle error appropriately, maybe set an error state
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
