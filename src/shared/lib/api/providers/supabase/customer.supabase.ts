import { supabase } from '@/lib/shared/supabase';
import { handleApiError } from '../../core/api-error';
import { getAuthTenantId } from '../../core/auth-utils';
import { mapCustomerFromDB, mapCustomerToDB } from '../../mappers/customer.mapper';
import type { ICustomerApi } from '../interfaces';

export const customerSupabaseApi: ICustomerApi = {
  async getCustomers() {
    const { data, error } = await supabase.from('customers').select('*').order('criado_em', { ascending: false });
    if (error) handleApiError(error, 'Erro ao buscar clientes');
    return (data || []).map(mapCustomerFromDB);
  },
  async createCustomer(payload: any) {
    const tenantId = await getAuthTenantId();
    const { data, error } = await supabase.from('customers').insert([mapCustomerToDB(payload, tenantId)]).select().single();
    if (error) handleApiError(error, 'Erro ao criar cliente');
    return mapCustomerFromDB(data);
  },
  async updateCustomer(id: string, payload: any) {
    const tenantId = await getAuthTenantId();
    const { data, error } = await supabase.from('customers').update(mapCustomerToDB(payload, tenantId)).eq('id', id).select().single();
    if (error) handleApiError(error, 'Erro ao atualizar cliente');
    return mapCustomerFromDB(data);
  },
  async deleteCustomer(id: string) {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) handleApiError(error, 'Erro ao excluir cliente');
  }
};
