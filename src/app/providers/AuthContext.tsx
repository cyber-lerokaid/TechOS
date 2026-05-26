import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/shared/supabase';
import { MOCK_LOGGED_USER, MOCK_TENANT } from '@/data/mock-data';

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
    return localStorage.getItem('techos_is_demo') === 'true';
  });
  
  const isDemoMode = isExplicitDemo;

  const enterDemoMode = () => {
    localStorage.setItem('techos_is_demo', 'true');
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
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
    localStorage.removeItem('techos_is_demo');
    setIsExplicitDemo(false);
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, nome: string) => {
    localStorage.removeItem('techos_is_demo');
    setIsExplicitDemo(false);
    
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
    
    // O Supabase, quando configurado para evitar enumeração de email, retorna success mas a propriedade identities vem vazia se o email já estiver em uso.
    if (data?.user && data.user.identities && data.user.identities.length === 0) {
      return { error: new Error('Este e-mail já está cadastrado.') };
    }

    if (!error && data.user) {
      // Mock tenant creation
      setTenant({ ...MOCK_TENANT, nome_loja: 'Minha Assistência', telefone: '' });
    }
    return { error };
  };

  const signOut = async () => {
    localStorage.removeItem('techos_is_demo');
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
