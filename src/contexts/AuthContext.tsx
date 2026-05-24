import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { MOCK_LOGGED_USER, MOCK_TENANT } from '../data/mock-data';

interface AuthContextType {
  user: any;
  tenant: any;
  loading: boolean;
  isDemoMode: boolean;
  enterDemoMode: () => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExplicitDemo, setIsExplicitDemo] = useState(() => {
    return sessionStorage.getItem('techos_is_demo') === 'true';
  });
  
  const isDemoMode = isExplicitDemo;

  const enterDemoMode = () => {
    sessionStorage.setItem('techos_is_demo', 'true');
    setIsExplicitDemo(true);
    setUser(MOCK_LOGGED_USER);
    setTenant(MOCK_TENANT);
  };

  useEffect(() => {
    // Fluxo real do Supabase
    const checkSession = async () => {
      if (isExplicitDemo) {
        setUser(MOCK_LOGGED_USER);
        setTenant(MOCK_TENANT);
        setLoading(false);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        // Mock fetch tenant based on user in real scenario
        setTenant(MOCK_TENANT);
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Ignora se estiver no modo demo para não piscar a interface
      if (isExplicitDemo) return;

      setUser(session?.user || null);
      if (session?.user) {
        setTenant(MOCK_TENANT);
      } else {
        setTenant(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isExplicitDemo]);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, nome: string) => {
    // Na vida real, criaria o usuário e depois inseria na tabela tenants
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          nome: nome
        }
      }
    });
    if (!error && data.user) {
      // Mock tenant creation
      setTenant({ ...MOCK_TENANT, nome_loja: 'Minha Assistência', telefone: '' });
    }
    return { error };
  };

  const signOut = async () => {
    sessionStorage.removeItem('techos_is_demo');
    setIsExplicitDemo(false);
    setUser(null);
    setTenant(null);
    if (!isExplicitDemo) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, tenant, loading, isDemoMode, enterDemoMode, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
