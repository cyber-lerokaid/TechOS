import type { IOrderApi } from '../interfaces';
import { demoStore, delay } from './demo-store';
import { mapOrderFromDB } from '../../mappers/order.mapper';

const joinCustomer = (os: any) => {
  const customer = demoStore.customers.find(c => c.id === os.customer_id);
  return {
    ...os,
    customers: customer ? { nome: customer.nome, telefone: customer.telefone } : null
  };
};

export const orderDemoApi: IOrderApi = {
  async getOrders() {
    await delay(600);
    return demoStore.orders.map(joinCustomer).map(mapOrderFromDB);
  },
  async createOrder(payload: any) {
    await delay(800);
    const newDbRow = {
      id: `demo_os_${Date.now()}`,
      ...payload,
      numero_os: Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      status: 'orcamento_pendente',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    demoStore.orders.unshift(newDbRow as any);
    demoStore.saveOrders();
    return mapOrderFromDB(joinCustomer(newDbRow));
  },
  async updateOrderStatus(id: string, status: string) {
    await delay(500);
    const idx = demoStore.orders.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('OS não encontrada');
    demoStore.orders[idx].status = status as any;
    demoStore.orders[idx].atualizado_em = new Date().toISOString();
    demoStore.saveOrders();
    return mapOrderFromDB(joinCustomer(demoStore.orders[idx]));
  },
  async updateOrder(id: string, payload: any) {
    await delay(500);
    const idx = demoStore.orders.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('OS não encontrada');
    
    if (payload.valorMaoObra !== undefined) demoStore.orders[idx].valor_mao_obra = payload.valorMaoObra;
    if (payload.valorPecas !== undefined) demoStore.orders[idx].valor_pecas = payload.valorPecas;
    if (payload.status !== undefined) demoStore.orders[idx].status = payload.status;
    
    demoStore.orders[idx].atualizado_em = new Date().toISOString();
    demoStore.saveOrders();
    return mapOrderFromDB(joinCustomer(demoStore.orders[idx]));
  }
};
