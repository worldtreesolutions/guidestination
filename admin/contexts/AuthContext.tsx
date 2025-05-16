
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  isAdmin: false,
  isSuperAdmin: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const setupAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);

      if (data.session?.user) {
        // Check if user has admin role
        const { data: userData } = await supabase
          .from('staff')
          .select('role_id')
          .eq('user_id', data.session.user.id)
          .single();

        if (userData) {
          // Fetch role details
          const { data: roleData } = await supabase
            .from('roles')
            .select('name')
            .eq('id', userData.role_id)
            .single();

          if (roleData) {
            setIsAdmin(true);
            setIsSuperAdmin(roleData.name === 'super_admin');
          }
        }
      }

      setIsLoading(false);

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user || null);

          if (session?.user) {
            // Check if user has admin role
            const { data: userData } = await supabase
              .from('staff')
              .select('role_id')
              .eq('user_id', session.user.id)
              .single();

            if (userData) {
              // Fetch role details
              const { data: roleData } = await supabase
                .from('roles')
                .select('name')
                .eq('id', userData.role_id)
                .single();

              if (roleData) {
                setIsAdmin(true);
                setIsSuperAdmin(roleData.name === 'super_admin');
              }
            }
          } else {
            setIsAdmin(false);
            setIsSuperAdmin(false);
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signOut,
        isAdmin,
        isSuperAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
