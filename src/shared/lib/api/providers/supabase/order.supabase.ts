import { supabase } from '@/lib/shared/supabase';
import { handleApiError } from '../../core/api-error';
import { getAuthTenantId } from '../../core/auth-utils';
import { mapOrderFromDB, mapOrderToDB } from '../../mappers/order.mapper';
import type { IOrderApi } from '../interfaces';

export const orderSupabaseApi: IOrderApi = {
  async getOrders() {
    const { data, error } = await supabase.from('service_orders').select('*, customers(nome, telefone)').order('criado_em', { ascending: false });
    if (error) handleApiError(error, 'Erro ao buscar ordens de serviço');
    return (data || []).map(mapOrderFromDB);
  },
  async createOrder(payload: any) {
    const tenantId = await getAuthTenantId();
    const { data, error } = await supabase.from('service_orders').insert([mapOrderToDB(payload, tenantId)]).select('*, customers(nome, telefone)').single();
    if (error) handleApiError(error, 'Erro ao criar ordem de serviço');
    return mapOrderFromDB(data);
  },
  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabase.from('service_orders').update({ status }).eq('id', id).select('*, customers(nome, telefone)').single();
    if (error) handleApiError(error, 'Erro ao atualizar status da OS');
    return mapOrderFromDB(data);
  }
};
