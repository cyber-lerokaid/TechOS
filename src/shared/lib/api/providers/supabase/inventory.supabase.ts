import { supabase } from '@/lib/shared/supabase';
import { handleApiError } from '../../core/api-error';
import { getAuthTenantId } from '../../core/auth-utils';
import { mapInventoryFromDB, mapInventoryToDB } from '../../mappers/inventory.mapper';
import type { IInventoryApi } from '../interfaces';

export const inventorySupabaseApi: IInventoryApi = {
  async getInventory() {
    const { data, error } = await supabase.from('inventory').select('*').order('criado_em', { ascending: false });
    if (error) handleApiError(error, 'Erro ao buscar estoque');
    return (data || []).map(mapInventoryFromDB);
  },
  async createInventoryItem(payload: any) {
    const tenantId = await getAuthTenantId();
    const { data, error } = await supabase.from('inventory').insert([mapInventoryToDB(payload, tenantId)]).select().single();
    if (error) handleApiError(error, 'Erro ao criar item no estoque');
    return mapInventoryFromDB(data);
  },
  async updateInventoryItem(id: string, payload: any) {
    const updateData: any = {};
    if (payload.quantidadeEstoque !== undefined) updateData.quantidade_estoque = payload.quantidadeEstoque;
    if (payload.precoCusto !== undefined) updateData.preco_custo = payload.precoCusto;
    if (payload.precoVenda !== undefined) updateData.preco_venda = payload.precoVenda;
    
    const { data, error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) handleApiError(error, 'Erro ao atualizar item no estoque');
    return mapInventoryFromDB(data);
  }
};
