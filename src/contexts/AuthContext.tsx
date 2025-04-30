import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the User type
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, this would check with your backend or Firebase/Supabase
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      // In a real app, this would call your backend or Firebase/Supabase
      // For demo purposes, we'll simulate a successful login with mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Mock successful login
      if (email && password) {
        const mockUser: User = {
          id: '123456',
          email,
          name: email.split('@')[0],
          role: 'admin',
        };
        
        setUser(mockUser);
        
        // Store user in localStorage if rememberMe is true
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(mockUser));
        }
        
        return;
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
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
      // In a real app, this would call your backend or Firebase/Supabase
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would call your backend or Firebase/Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Mock successful registration
      const mockUser: User = {
        id: '123456',
        email,
        name,
        role: 'user',
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);