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
  userRole: number | null; // Corrected type
  providerId: string | null; // Corrected type
  error: string | null;
  login: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; roleId: number | null; providerId: string | null }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string, user_type?: string) => Promise<{ user: User | null; session: Session | null; needsVerification?: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>; // Added for completeness
  updateUserProfile: (metadata: any) => Promise<void>; // Added for completeness
  setError: (error: string | null) => void; // Added for completeness
  // Removed setupPasswordForExistingUser, checkUserVerification, checkUserExists as they are not standard auth operations for this context
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
  const [userRole, setUserRole] = useState<number | null>(null); // Corrected state type
  const [providerId, setProviderId] = useState<string | null>(null); // Corrected state type

  // Check if user is logged in on mount and set up auth state listener
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { session: currentSession } = await authService.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession?.user);
        if (currentSession?.user) {
          // Fetch user details if session exists
          const { roleId: currentRoleId, providerId: currentProviderId } = await authService.getUserDetails();
          setUserRole(currentRoleId);
          setProviderId(currentProviderId);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsAuthenticated(!!newSession?.user);
        if (newSession?.user) {
          const { roleId: currentRoleId, providerId: currentProviderId } = await authService.getUserDetails();
          setUserRole(currentRoleId);
          setProviderId(currentProviderId);
        } else {
          setUserRole(null);
          setProviderId(null);
        }
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
      const { user: loggedInUser, session: loggedInSession, roleId, providerId: currentProviderId } = await authService.signInWithEmail(email, password);
      setUser(loggedInUser);
      setSession(loggedInSession);
      setUserRole(roleId); // roleId is number | null
      setProviderId(currentProviderId); // providerId is string | null
      setIsAuthenticated(!!loggedInUser);
      return { user: loggedInUser, session: loggedInSession, roleId, providerId: currentProviderId };
    } catch (e: any) {
      console.error("Login error in AuthContext:", e);
      setError(e.message || "Login failed");
      setIsAuthenticated(false);
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
      const { signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { // Corrected: 'data' for user_metadata with standard signUp
            name: name,
            phone: phone,
            user_type: user_type || "customer",
          },
        },
      });

      if (signUpError) {
        console.error("Registration error in AuthContext (signUp):", signUpError);
        setError(signUpError.message || "Registration failed");
        throw signUpError;
      }
      
      // Handle cases where user might exist but session isn't returned (e.g., email verification needed)
      if (signUpData.user && !signUpData.session && !signUpData.user.email_confirmed_at) {
         setError("Registration successful. Please check your email for verification.");
         // Don't set user/session yet, wait for verification/login
         return { user: signUpData.user, session: null, needsVerification: true };
      }

      if (!signUpData.user || !signUpData.session) {
         throw new Error("Registration failed: No user or session returned, and email may already be confirmed or issue exists.");
      }
      
      // If sign up is successful and returns a session (e.g., auto-confirmation enabled)
      setUser(signUpData.user);
      setSession(signUpData.session);
      setIsAuthenticated(true);
      // Fetch role/provider after successful signup
      const { roleId: currentRoleId, providerId: currentProviderId } = await authService.getUserDetails();
      setUserRole(currentRoleId);
      setProviderId(currentProviderId);

      return { user: signUpData.user, session: signUpData.session, needsVerification: !signUpData.user.email_confirmed_at };

    } catch (e: any) {
      console.error("Registration error in AuthContext:", e);
      if (e.message && e.message.includes("User already registered")) {
          setError("An account with this email already exists.");
      } else {
          setError(e.message || "Registration failed");
      }
      setIsAuthenticated(false);
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
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};