import type { ICustomerApi } from '../interfaces';
import { demoStore, delay } from './demo-store';
import { mapCustomerFromDB } from '../../mappers/customer.mapper';

export const customerDemoApi: ICustomerApi = {
  async getCustomers() {
    await delay(600);
    return demoStore.customers.map(c => {
      const customerOrders = demoStore.orders.filter(o => o.customer_id === c.id);
      const total_os = customerOrders.length;
      const total_gasto = customerOrders.reduce((acc, o) => acc + (o.valor_mao_obra || 0) + (o.valor_pecas || 0), 0);
      return mapCustomerFromDB({ ...c, total_os, total_gasto });
    });
  },
  async createCustomer(payload: any) {
    await delay(800);
    const newDbRow = {
      id: `demo_cust_${Date.now()}`,
      nome: payload.nome,
      telefone: payload.telefone,
      email: payload.email,
      total_gasto: 0,
      total_os: 0,
      criado_em: new Date().toISOString(),
    };
    demoStore.customers.unshift(newDbRow as any);
    const customerOrders = demoStore.orders.filter(o => o.customer_id === newDbRow.id);
    const total_os = customerOrders.length;
    const total_gasto = customerOrders.reduce((acc, o) => acc + (o.valor_mao_obra || 0) + (o.valor_pecas || 0), 0);
    return mapCustomerFromDB({ ...newDbRow, total_os, total_gasto });
  },
  async updateCustomer(id: string, payload: any) {
    await delay(700);
    const idx = demoStore.customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Cliente não encontrado');
    demoStore.customers[idx] = { ...demoStore.customers[idx], ...payload };
    const c = demoStore.customers[idx];
    const customerOrders = demoStore.orders.filter(o => o.customer_id === c.id);
    const total_os = customerOrders.length;
    const total_gasto = customerOrders.reduce((acc, o) => acc + (o.valor_mao_obra || 0) + (o.valor_pecas || 0), 0);
    return mapCustomerFromDB({ ...c, total_os, total_gasto });
  },
  async deleteCustomer(id: string) {
    await delay(600);
    demoStore.customers = demoStore.customers.filter(c => c.id !== id);
  }
};
