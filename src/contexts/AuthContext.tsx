
    import { createContext, useContext, useEffect, useState, ReactNode } from "react";
    import { supabase } from "@/integrations/supabase/client";
    import { Session, User, AuthError, AuthResponse } from "@supabase/supabase-js";
    import authService from "@/services/authService";

    interface AuthContextType {
      user: User | null;
      session: Session | null;
      loading: boolean;
      isAuthenticated: boolean;
      login: (email: string, password: string) => Promise<AuthResponse>;
      register: (email: string, password: string, additionalData?: Record<string, any>) => Promise<AuthResponse>;
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
            const { data, error } = await supabase.auth.getSession();
            if (error) {
              console.error("Error getting session:", error.message);
            }
            setSession(data.session);
            setUser(data.session?.user ?? null);
          } catch (e: any) {
            console.error("Exception in fetchSession:", e.message);
          } finally {
            setLoading(false);
          }
        };

        fetchSession();

        const {  { subscription } } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setLoading(false);
          }
        );

        return () => {
          subscription?.unsubscribe();
        };
      }, []);

      const login = async (email: string, password: string): Promise<AuthResponse> => {
        const response = await authService.signIn(email, password);
        // Assuming authService.signIn directly returns AuthResponse or a compatible structure
        return response; 
      };
      
      const register = async (email: string, password: string, additionalData?: Record<string, any>): Promise<AuthResponse> => {
        const response = await authService.signUp(email, password, additionalData);
        // Assuming authService.signUp directly returns AuthResponse or a compatible structure
        return response;
      };

      const signOut = async (): Promise<{ error: AuthError | null }> => {
        const response = await authService.signOut();
        return response;
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
  