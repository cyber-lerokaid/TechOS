import type { IDataProvider } from './providers/interfaces';
import { DemoProvider } from './providers/demo';
import { SupabaseProvider } from './providers/supabase';

// Função sincrona: checa o localStorage
export const getActiveProvider = (): IDataProvider => {
  const isDemo = localStorage.getItem('techos_is_demo') === 'true';
  return isDemo ? DemoProvider : SupabaseProvider;
};
