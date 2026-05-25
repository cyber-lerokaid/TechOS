import { supabase } from '@/lib/shared/supabase';

export const getAuthTenantId = async (): Promise<string> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) {
    throw new Error('Usuário não autenticado.');
  }
  const tenantId = session.user.user_metadata?.tenant_id;
  if (!tenantId) {
    throw new Error('Tenant ID não encontrado no perfil do usuário.');
  }
  return tenantId;
};
