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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  // @ Adjust register return type to match implementation
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>; 
  setupPasswordForExistingUser: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkUserVerification: (email: string) => Promise<UserVerificationStatus>;
  checkUserExists: (email: string) => Promise<{ exists: boolean; userId?: string }>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  // @ Update default register function to match new type
  register: async () => ({ success: false, error: 'Default function not implemented' }), 
  setupPasswordForExistingUser: async () => {},
  resetPassword: async () => {},
  checkUserVerification: async () => ({ exists: false, verified: false }),
  checkUserExists: async () => ({ exists: false }),
});

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  const login = async (email: string, password: string, rememberMe?: boolean) => {
    setIsLoading(true);
    try {
      const { user: authUser, session: authSession, roleId, providerId } = await authService.signInWithEmail(email, password);
      
      if (authUser && authSession) {
        setUser(authUser);
        setSession(authSession);
        setIsAuthenticated(true);
        
        // Store role and provider ID in user metadata if available
        if (roleId || providerId) {
          const metadata: any = { ...authUser.user_metadata };
          if (roleId) metadata.role_id = roleId;
          if (providerId) {
            // Ensure provider_id is stored as a number
            metadata.provider_id = Number(providerId);
            console.log('Setting provider_id in metadata:', metadata.provider_id, 'Type:', typeof metadata.provider_id);
          }
          
          try {
            // Update user metadata with provider_id
            const updatedUser = await authService.updateUserMetadata(metadata);
            console.log('Updated user metadata:', updatedUser.user_metadata);
            
            // Set the updated user with metadata
            setUser(updatedUser);
          } catch (metadataError) {
            console.error('Error updating user metadata:', metadataError);
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  // @ Ensure return type matches the context definition
  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => { 
    setIsLoading(true);
    try {
      // Check if user already exists in the custom users table
      const { exists, verified } = await authService.checkUserVerification(email);
      
      if (exists) {
        // If user exists but is not verified, they need to contact support
        if (!verified) {
          return { success: false, error: 'Your account is pending verification. Please contact support.' };
        }
        
        // If user exists and is verified, set up password for existing user
        const { user: authUser, session: authSession } = await authService.setupPasswordForExistingUser(email, password, name);
        
        if (authUser && authSession) {
          setUser(authUser);
          setSession(authSession);
          setIsAuthenticated(true);
          return { success: true };
        }
      } else {
        // If user doesn't exist, create a new user in the custom users table
        // This is just a placeholder - in a real app, you'd have admin approval
        const { userId } = await authService.createUser({
          name,
          email,
          user_type: 'activity_provider'
        });
        
        // Generate verification token (in a real app, you'd send an email)
        await authService.createEmailVerification(userId);
        
        return { 
          success: false, 
          error: 'Registration submitted. Your account needs to be verified by an admin before you can log in.' 
        };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Setup password for existing user
  const setupPasswordForExistingUser = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { user, session } = await authService.setupPasswordForExistingUser(email, password, name);
      
      if (!user) {
        throw new Error('Failed to set up password: No user returned');
      }
      
      setUser(user);
      setSession(session);
    } catch (error) {
      console.error('Setup password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user exists
  const checkUserExists = async (email: string): Promise<{ exists: boolean; userId?: string }> => {
    try {
      return await authService.checkUserExists(email);
    } catch (error) {
      console.error('Check user exists error:', error);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // Check user verification status
  const checkUserVerification = async (email: string): Promise<UserVerificationStatus> => {
    try {
      return await authService.checkUserVerification(email);
    } catch (error) {
      console.error('Check verification error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        setupPasswordForExistingUser,
        resetPassword,
        checkUserVerification,
        checkUserExists,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);