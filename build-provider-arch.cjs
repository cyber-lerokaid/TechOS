const fs = require('fs');
const path = require('path');

const makeDir = (dir) => fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
makeDir('src/shared/lib/api/providers');
makeDir('src/shared/lib/api/providers/demo');
makeDir('src/shared/lib/api/providers/supabase');

const files = {
  // -------------------------
  // 1. Interfaces
  // -------------------------
  'src/shared/lib/api/providers/interfaces.ts': `
export interface ICustomerApi {
  getCustomers(): Promise<any[]>;
  createCustomer(payload: any): Promise<any>;
  updateCustomer(id: string, payload: any): Promise<any>;
  deleteCustomer(id: string): Promise<void>;
}

export interface IOrderApi {
  getOrders(): Promise<any[]>;
  createOrder(payload: any): Promise<any>;
  updateOrderStatus(id: string, status: string): Promise<any>;
}

export interface IInventoryApi {
  getInventory(): Promise<any[]>;
  createInventoryItem(payload: any): Promise<any>;
}

export interface IDataProvider {
  customers: ICustomerApi;
  orders: IOrderApi;
  inventory: IInventoryApi;
}
`,

  // -------------------------
  // 2. Demo Store (In-memory)
  // -------------------------
  'src/shared/lib/api/providers/demo/demo-store.ts': `
import { MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_PRODUCTS } from '@/data/mock-data';

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class DemoStore {
  public customers = [...MOCK_CUSTOMERS].map(c => ({
    ...c,
    // Add snake_case properties so the Mappers can parse them seamlessly
    total_gasto: c.totalGasto,
    total_os: c.totalOs,
    criado_em: c.criadoEm || new Date().toISOString()
  }));
  
  public orders = [...MOCK_ORDERS].map(o => ({
    ...o,
    customer_id: o.customerId,
    customer_nome: o.customerNome,
    customer_telefone: o.customerTelefone,
    numero_os: o.numeroOs,
    device_label: o.deviceLabel,
    problema_relatado: o.problemaRelatado,
    valor_mao_obra: o.valorMaoObra,
    valor_pecas: o.valorPecas,
    criado_em: o.criadoEm,
    atualizado_em: o.atualizadoEm,
    technician_id: o.technicianId,
    technician_nome: o.technicianNome
  }));
  
  public inventory = [...MOCK_PRODUCTS].map(p => ({
    ...p,
    quantidade_estoque: p.quantidadeEstoque,
    preco_custo: p.precoCusto,
    preco_venda: p.precoVenda,
    criado_em: p.criadoEm || new Date().toISOString()
  }));
}

export const demoStore = new DemoStore();
`,

  // -------------------------
  // 3. Demo Providers
  // -------------------------
  'src/shared/lib/api/providers/demo/customer.demo.ts': `
import { ICustomerApi } from '../interfaces';
import { demoStore, delay } from './demo-store';
import { mapCustomerFromDB } from '../../mappers/customer.mapper';

export const customerDemoApi: ICustomerApi = {
  async getCustomers() {
    await delay(600);
    return demoStore.customers.map(mapCustomerFromDB);
  },
  async createCustomer(payload: any) {
    await delay(800);
    const newDbRow = {
      id: \`demo_cust_\${Date.now()}\`,
      nome: payload.nome,
      telefone: payload.telefone,
      email: payload.email,
      total_gasto: 0,
      total_os: 0,
      criado_em: new Date().toISOString(),
    };
    demoStore.customers.unshift(newDbRow as any);
    return mapCustomerFromDB(newDbRow);
  },
  async updateCustomer(id: string, payload: any) {
    await delay(700);
    const idx = demoStore.customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Cliente não encontrado');
    demoStore.customers[idx] = { ...demoStore.customers[idx], ...payload };
    return mapCustomerFromDB(demoStore.customers[idx]);
  },
  async deleteCustomer(id: string) {
    await delay(600);
    demoStore.customers = demoStore.customers.filter(c => c.id !== id);
  }
};
`,
  'src/shared/lib/api/providers/demo/order.demo.ts': `
import { IOrderApi } from '../interfaces';
import { demoStore, delay } from './demo-store';
import { mapOrderFromDB } from '../../mappers/order.mapper';

export const orderDemoApi: IOrderApi = {
  async getOrders() {
    await delay(600);
    return demoStore.orders.map(mapOrderFromDB);
  },
  async createOrder(payload: any) {
    await delay(800);
    const newDbRow = {
      id: \`demo_os_\${Date.now()}\`,
      ...payload,
      numero_os: Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      status: 'orcamento_pendente',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    demoStore.orders.unshift(newDbRow as any);
    return mapOrderFromDB(newDbRow);
  },
  async updateOrderStatus(id: string, status: string) {
    await delay(500);
    const idx = demoStore.orders.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('OS não encontrada');
    demoStore.orders[idx].status = status;
    demoStore.orders[idx].atualizado_em = new Date().toISOString();
    return mapOrderFromDB(demoStore.orders[idx]);
  }
};
`,
  'src/shared/lib/api/providers/demo/inventory.demo.ts': `
import { IInventoryApi } from '../interfaces';
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
      id: \`demo_inv_\${Date.now()}\`,
      ...payload,
      quantidade_estoque: payload.quantidadeEstoque,
      preco_custo: payload.precoCusto,
      preco_venda: payload.precoVenda,
      criado_em: new Date().toISOString(),
    };
    demoStore.inventory.unshift(newDbRow as any);
    return mapInventoryFromDB(newDbRow);
  }
};
`,

  // -------------------------
  // 4. Supabase Providers (Moved current API logic here)
  // -------------------------
  'src/shared/lib/api/providers/supabase/customer.supabase.ts': `
import { supabase } from '@/lib/shared/supabase';
import { handleApiError } from '../../core/api-error';
import { getAuthTenantId } from '../../core/auth-utils';
import { mapCustomerFromDB, mapCustomerToDB } from '../../mappers/customer.mapper';
import { ICustomerApi } from '../interfaces';

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
`,
  'src/shared/lib/api/providers/supabase/order.supabase.ts': `
import { supabase } from '@/lib/shared/supabase';
import { handleApiError } from '../../core/api-error';
import { getAuthTenantId } from '../../core/auth-utils';
import { mapOrderFromDB, mapOrderToDB } from '../../mappers/order.mapper';
import { IOrderApi } from '../interfaces';

export const orderSupabaseApi: IOrderApi = {
  async getOrders() {
    const { data, error } = await supabase.from('service_orders').select('*').order('criado_em', { ascending: false });
    if (error) handleApiError(error, 'Erro ao buscar ordens de serviço');
    return (data || []).map(mapOrderFromDB);
  },
  async createOrder(payload: any) {
    const tenantId = await getAuthTenantId();
    const { data, error } = await supabase.from('service_orders').insert([mapOrderToDB(payload, tenantId)]).select().single();
    if (error) handleApiError(error, 'Erro ao criar ordem de serviço');
    return mapOrderFromDB(data);
  },
  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabase.from('service_orders').update({ status }).eq('id', id).select().single();
    if (error) handleApiError(error, 'Erro ao atualizar status da OS');
    return mapOrderFromDB(data);
  }
};
`,
  'src/shared/lib/api/providers/supabase/inventory.supabase.ts': `
import { supabase } from '@/lib/shared/supabase';
import { handleApiError } from '../../core/api-error';
import { getAuthTenantId } from '../../core/auth-utils';
import { mapInventoryFromDB, mapInventoryToDB } from '../../mappers/inventory.mapper';
import { IInventoryApi } from '../interfaces';

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
  }
};
`,

  // -------------------------
  // 5. Provider Configurations
  // -------------------------
  'src/shared/lib/api/providers/demo/index.ts': `
import { IDataProvider } from '../interfaces';
import { customerDemoApi } from './customer.demo';
import { orderDemoApi } from './order.demo';
import { inventoryDemoApi } from './inventory.demo';

export const DemoProvider: IDataProvider = {
  customers: customerDemoApi,
  orders: orderDemoApi,
  inventory: inventoryDemoApi,
};
`,
  'src/shared/lib/api/providers/supabase/index.ts': `
import { IDataProvider } from '../interfaces';
import { customerSupabaseApi } from './customer.supabase';
import { orderSupabaseApi } from './order.supabase';
import { inventorySupabaseApi } from './inventory.supabase';

export const SupabaseProvider: IDataProvider = {
  customers: customerSupabaseApi,
  orders: orderSupabaseApi,
  inventory: inventorySupabaseApi,
};
`,

  // -------------------------
  // 6. API Proxy Factory
  // -------------------------
  'src/shared/lib/api/provider-factory.ts': `
import { IDataProvider } from './providers/interfaces';
import { DemoProvider } from './providers/demo';
import { SupabaseProvider } from './providers/supabase';

// Função sincrona: checa o sessionStorage
export const getActiveProvider = (): IDataProvider => {
  const isDemo = sessionStorage.getItem('techos_is_demo') === 'true';
  return isDemo ? DemoProvider : SupabaseProvider;
};
`,

  // -------------------------
  // 7. Proxied APIs (replaces current customer.api.ts)
  // -------------------------
  'src/shared/lib/api/customer.api.ts': `
import { getActiveProvider } from './provider-factory';

export const customerApi = {
  getCustomers: () => getActiveProvider().customers.getCustomers(),
  createCustomer: (payload: any) => getActiveProvider().customers.createCustomer(payload),
  updateCustomer: (id: string, payload: any) => getActiveProvider().customers.updateCustomer(id, payload),
  deleteCustomer: (id: string) => getActiveProvider().customers.deleteCustomer(id),
};
`,
  'src/shared/lib/api/order.api.ts': `
import { getActiveProvider } from './provider-factory';

export const orderApi = {
  getOrders: () => getActiveProvider().orders.getOrders(),
  createOrder: (payload: any) => getActiveProvider().orders.createOrder(payload),
  updateOrderStatus: (id: string, status: string) => getActiveProvider().orders.updateOrderStatus(id, status),
};
`,
  'src/shared/lib/api/inventory.api.ts': `
import { getActiveProvider } from './provider-factory';

export const inventoryApi = {
  getInventory: () => getActiveProvider().inventory.getInventory(),
  createInventoryItem: (payload: any) => getActiveProvider().inventory.createInventoryItem(payload),
};
`
};

for (const [filePath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, filePath), content.trim() + '\n');
}

console.log('✅ API Proxies and Providers created successfully!');
