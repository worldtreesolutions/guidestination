import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import authService, { UserVerificationStatus } from "@/services/authService";

// Re-export User type for convenience
export type { User };

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; roleId?: string; providerId?: string }>;
  logout: () => Promise<void>;
  // @ Adjust register return type to match implementation
  register: (email: string, password: string, name: string, phone?: string, user_type?: string) => Promise<{ user: User | null; session: Session | null; needsVerification?: boolean; error?: string }>; 
  setupPasswordForExistingUser: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkUserVerification: (email: string) => Promise<UserVerificationStatus>;
  checkUserExists: (email: string) => Promise<{ exists: boolean; userId?: string }>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);

  // Check if user is logged in on mount and set up auth state listener
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { session } = await authService.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the refactored authService.signInWithEmail which uses standard client
      const { user: loggedInUser, session: loggedInSession, roleId, providerId } = await authService.signInWithEmail(email, password);
      setUser(loggedInUser);
      setSession(loggedInSession);
      setUserRole(roleId);
      setProviderId(providerId);
      return { user: loggedInUser, session: loggedInSession, roleId, providerId };
    } catch (e: any) {
      console.error("Login error in AuthContext:", e);
      setError(e.message || "Login failed");
      throw e; // Re-throw for the form to handle
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified register function using standard supabase.auth.signUp
  const register = async (email: string, password: string, name: string, phone?: string, user_type?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use standard Supabase sign up
      const { signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            phone: phone,
            user_type: user_type || "customer", // Default to customer if not specified
          },
        },
      });

      if (signUpError) {
        console.error("Registration error in AuthContext (signUp):", signUpError);
        setError(signUpError.message || "Registration failed");
        throw signUpError;
      }

      if (!signUpData.user || !signUpData.session) {
        // Handle cases where user might exist but session isn't returned (e.g., email verification needed)
        if (signUpData.user && !signUpData.session) {
          setError("Registration successful, but requires email verification.");
          return { user: signUpData.user, session: null, needsVerification: true };
        }
        throw new Error("Registration failed: No user or session returned.");
      }

      // If sign up is successful and returns a session (e.g., auto-confirmation enabled)
      setUser(signUpData.user);
      setSession(signUpData.session);
      return { user: signUpData.user, session: signUpData.session, needsVerification: !signUpData.user.email_confirmed_at };

    } catch (e: any) {
      console.error("Registration error in AuthContext:", e);
      if (e.message && e.message.includes("User already registered")) {
        setError("An account with this email already exists.");
      } else {
        setError(e.message || "Registration failed");
      }
      throw e; // Re-throw for the form to handle
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      setProviderId(null);
    } catch (e: any) {
      console.error("Logout error:", e);
      setError(e.message || "Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
    } catch (e: any) {
      console.error("Reset password error:", e);
      setError(e.message || "Failed to send reset password email.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Update password function
  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.updatePasswordWithResetToken(newPassword);
    } catch (e: any) {
      console.error("Update password error:", e);
      setError(e.message || "Failed to update password.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile function
  const updateUserProfile = async (metadata: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateUserMetadata(metadata);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (e: any) {
      console.error("Update profile error:", e);
      setError(e.message || "Failed to update profile.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    userRole,
    providerId,
    isLoading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateUserProfile,
    setError, // Expose setError if components need to manually set context errors
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);