
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User, Subscription } from "@supabase/supabase-js";
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
        const {  { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting initial session:", error);
        } else {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          await checkAdminRole(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error("Exception in getInitialSession:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const {  { subscription }, error: authListenerError } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      await checkAdminRole(newSession?.user ?? null);
      // Ensure loading is set to false after the initial event or any subsequent event
      // if it hasn't been set by getInitialSession's finally block yet.
      if (loading && (_event === "INITIAL_SESSION" || _event === "SIGNED_IN" || _event === "SIGNED_OUT")) {
        setLoading(false);
      } else if (!loading && (_event !== "USER_UPDATED" && _event !== "TOKEN_REFRESHED" && _event !== "PASSWORD_RECOVERY")) {
         // For other significant events, if not already loading, we might not need to change loading state
         // but if an event implies a change that should stop a loading spinner, ensure it does.
         // This part might need refinement based on specific UX needs for different auth events.
      }
    });

    if(authListenerError) {
      console.error("Error setting up onAuthStateChange listener:", authListenerError);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Removed loading from dependency array, initial loading is handled by finally and event checks

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
