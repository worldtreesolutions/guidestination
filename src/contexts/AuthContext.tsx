
    import { createContext, useContext, useEffect, useState, ReactNode } from "react";
    import { supabase } from "@/integrations/supabase/client";
    import { Session, User, AuthError } from "@supabase/supabase-js";
    import authService from "@/services/authService";

    interface AuthContextType {
      user: User | null;
      session: Session | null;
      loading: boolean;
      isAuthenticated: boolean;
      // Using Supabase specific types for signIn and signUp if they come directly from supabase.auth
      // If authService wraps them and changes signature, adjust accordingly.
      // For now, assuming authService methods match common patterns.
      login: (email: string, password: string) => Promise<{  { user: User | null; session: Session | null; }; error: AuthError | null; }>;
      register: (email: string, password: string, additionalData?: Record<string, any>) => Promise<{  { user: User | null; session: Session | null; }; error: AuthError | null; }>;
      signOut: () => Promise<{ error: AuthError | null }>;
    }

    const AuthContext = createContext<AuthContextType | undefined>(undefined);

    export default function AuthProvider({ children }: { children: ReactNode }) {
      const [user, setUser] = useState<User | null>(null);
      const [session, setSession] = useState<Session | null>(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchSession = async () => {
          try {
            const {  { session: currentSession }, error } = await supabase.auth.getSession();
            if (error) {
              console.error("Error getting session:", error.message);
            }
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
          } catch (e: any) {
            console.error("Exception in fetchSession:", e.message);
          } finally {
            setLoading(false);
          }
        };

        fetchSession();

        const {  authListener } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setLoading(false); // Ensure loading is set to false on auth state change
          }
        );

        return () => {
          authListener?.unsubscribe();
        };
      }, []);

      // Ensure functions from authService are correctly typed and bound
      // These might need adjustment based on the actual implementation in authService.ts
      const login = async (email: string, password: string) => {
        // This is a common pattern, adjust if authService.signIn is different
        const response = await authService.signIn(email, password);
        return response as {  { user: User | null; session: Session | null; }; error: AuthError | null; };
      };
      
      const register = async (email: string, password: string, additionalData?: Record<string, any>) => {
        const response = await authService.signUp(email, password, additionalData);
        return response as {  { user: User | null; session: Session | null; }; error: AuthError | null; };
      };

      const signOut = async () => {
        const response = await authService.signOut();
        return response as { error: AuthError | null; };
      };


      const contextValue: AuthContextType = {
        user,
        session,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        signOut,
      };

      return (
        <AuthContext.Provider value={contextValue}>
          {children}
        </AuthContext.Provider>
      );
    }

    export const useAuth = (): AuthContextType => {
      const context = useContext(AuthContext);
      if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
      }
      return context;
    };
  