
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Mock user data since Firebase is not connected
export interface User {
  id: string;
  email: string;
  businessName: string;
  ownerName: string;
  role: "activity-provider" | "admin" | "user";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("guidestination-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login since Firebase is not connected
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: "provider-123",
        email,
        businessName: "Thai Adventure Tours",
        ownerName: "Somchai Jaidee",
        role: "activity-provider",
        createdAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      localStorage.setItem("guidestination-user", JSON.stringify(mockUser));
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user creation
      const newUser: User = {
        id: `provider-${Date.now()}`,
        email,
        businessName: userData.businessName || "New Business",
        ownerName: userData.ownerName || "New Owner",
        role: "activity-provider",
        createdAt: new Date().toISOString()
      };
      
      setUser(newUser);
      localStorage.setItem("guidestination-user", JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem("guidestination-user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
