import type { IInventoryApi } from '../interfaces';
import { demoStore, delay } from './demo-store';
import { mapInventoryFromDB } from '../../mappers/inventory.mapper';

export const inventoryDemoApi: IInventoryApi = {
  async getInventory() {
    await delay(500);
    return demoStore.inventory.map(mapInventoryFromDB);
  },
  async createInventoryItem(payload: any) {
    await delay(600);
    const newDbRow = {
      id: `demo_inv_${Date.now()}`,
      ...payload,
      quantidade_estoque: payload.quantidadeEstoque,
      preco_custo: payload.precoCusto,
      preco_venda: payload.precoVenda,
      criado_em: new Date().toISOString(),
    };
    demoStore.inventory.unshift(newDbRow as any);
    return mapInventoryFromDB(newDbRow);
  },
  async updateInventoryItem(id: string, payload: any) {
    await delay(300);
    const index = demoStore.inventory.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Product not found');
    
    const current = demoStore.inventory[index];
    const updated = {
      ...current,
      ...payload,
      quantidade_estoque: payload.quantidadeEstoque !== undefined ? payload.quantidadeEstoque : current.quantidade_estoque,
    };
    
    demoStore.inventory[index] = updated;
    return mapInventoryFromDB(updated);
  }
};
