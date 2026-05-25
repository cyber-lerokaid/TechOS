const fs = require('fs');
const path = require('path');

const dirs = [
  'src/shared/lib/api/core',
  'src/shared/lib/api/mappers',
  'src/shared/lib/hooks/customers',
  'src/shared/lib/hooks/orders',
  'src/shared/lib/hooks/inventory'
];

dirs.forEach(d => {
  fs.mkdirSync(path.join(__dirname, d), { recursive: true });
});

const files = {
  // -------------------------
  // CORE API
  // -------------------------
  'src/shared/lib/api/core/api-error.ts': `
export class ApiError extends Error {
  constructor(message: string, public statusCode?: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any, defaultMessage: string): never => {
  console.error('[API Error]', error);
  if (error.code && error.message) {
    throw new ApiError(error.message, error.code, error.details);
  }
  throw new ApiError(defaultMessage, '500', error);
};
`,
  'src/shared/lib/api/core/auth-utils.ts': `
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
`,

  // -------------------------
  // MAPPERS
  // -------------------------
  'src/shared/lib/api/mappers/customer.mapper.ts': `
export const mapCustomerFromDB = (dbRow: any) => ({
  id: dbRow.id,
  nome: dbRow.nome,
  telefone: dbRow.telefone,
  email: dbRow.email,
  totalGasto: Number(dbRow.total_gasto || 0),
  totalOs: Number(dbRow.total_os || 0),
  criadoEm: dbRow.criado_em,
});

export const mapCustomerToDB = (appModel: any, tenantId: string) => ({
  tenant_id: tenantId,
  nome: appModel.nome,
  telefone: appModel.telefone,
  email: appModel.email,
});
`,
  'src/shared/lib/api/mappers/order.mapper.ts': `
export const mapOrderFromDB = (dbRow: any) => ({
  id: dbRow.id,
  customerId: dbRow.customer_id,
  customerNome: dbRow.customer_nome,
  customerTelefone: dbRow.customer_telefone,
  numeroOs: dbRow.numero_os,
  status: dbRow.status,
  deviceLabel: dbRow.device_label,
  problemaRelatado: dbRow.problema_relatado,
  valorMaoObra: Number(dbRow.valor_mao_obra || 0),
  valorPecas: Number(dbRow.valor_pecas || 0),
  criadoEm: dbRow.criado_em,
  atualizadoEm: dbRow.atualizado_em,
});

export const mapOrderToDB = (appModel: any, tenantId: string) => ({
  tenant_id: tenantId,
  customer_id: appModel.customerId,
  customer_nome: appModel.customerNome,
  customer_telefone: appModel.customerTelefone,
  numero_os: appModel.numeroOs,
  status: appModel.status,
  device_label: appModel.deviceLabel,
  problema_relatado: appModel.problemaRelatado,
});
`,
  'src/shared/lib/api/mappers/inventory.mapper.ts': `
export const mapInventoryFromDB = (dbRow: any) => ({
  id: dbRow.id,
  nome: dbRow.nome,
  sku: dbRow.sku,
  quantidadeEstoque: Number(dbRow.quantidade_estoque || 0),
  precoCusto: Number(dbRow.preco_custo || 0),
  precoVenda: Number(dbRow.preco_venda || 0),
  criadoEm: dbRow.criado_em,
});

export const mapInventoryToDB = (appModel: any, tenantId: string) => ({
  tenant_id: tenantId,
  nome: appModel.nome,
  sku: appModel.sku,
  quantidade_estoque: appModel.quantidadeEstoque,
  preco_custo: appModel.precoCusto,
  preco_venda: appModel.precoVenda,
});
`,

  // -------------------------
  // APIs
  // -------------------------
  'src/shared/lib/api/customer.api.ts': `
import { supabase } from '@/lib/shared/supabase';
import { handleApiError } from './core/api-error';
import { getAuthTenantId } from './core/auth-utils';
import { mapCustomerFromDB, mapCustomerToDB } from './mappers/customer.mapper';

export const customerApi = {
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
  'src/shared/lib/api/order.api.ts': `
import { supabase } from '@/lib/shared/supabase';
import { handleApiError } from './core/api-error';
import { getAuthTenantId } from './core/auth-utils';
import { mapOrderFromDB, mapOrderToDB } from './mappers/order.mapper';

export const orderApi = {
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
  'src/shared/lib/api/inventory.api.ts': `
import { supabase } from '@/lib/shared/supabase';
import { handleApiError } from './core/api-error';
import { getAuthTenantId } from './core/auth-utils';
import { mapInventoryFromDB, mapInventoryToDB } from './mappers/inventory.mapper';

export const inventoryApi = {
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
  // REACT QUERY HOOKS
  // -------------------------
  'src/shared/lib/hooks/customers/useCustomerList.ts': `
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/shared/lib/api/customer.api';
import { useAuth } from '@/app/providers/AuthContext';

export const useCustomerList = () => {
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id;

  return useQuery({
    queryKey: ['customers', tenantId],
    queryFn: customerApi.getCustomers,
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
`,
  'src/shared/lib/hooks/customers/useCreateCustomer.ts': `
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/shared/lib/api/customer.api';
import { useAuth } from '@/app/providers/AuthContext';

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id;

  return useMutation({
    mutationFn: (payload: any) => customerApi.createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', tenantId] });
    },
  });
};
`,

  'src/shared/lib/hooks/orders/useOrderList.ts': `
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/shared/lib/api/order.api';
import { useAuth } from '@/app/providers/AuthContext';

export const useOrderList = () => {
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id;

  return useQuery({
    queryKey: ['orders', tenantId],
    queryFn: orderApi.getOrders,
    enabled: !!tenantId,
  });
};
`,
  'src/shared/lib/hooks/orders/useUpdateOrderStatus.ts': `
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/shared/lib/api/order.api';
import { useAuth } from '@/app/providers/AuthContext';

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id;

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => orderApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', tenantId] });
    },
  });
};
`,
  'src/shared/lib/hooks/inventory/useInventoryList.ts': `
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/shared/lib/api/inventory.api';
import { useAuth } from '@/app/providers/AuthContext';

export const useInventoryList = () => {
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id;

  return useQuery({
    queryKey: ['inventory', tenantId],
    queryFn: inventoryApi.getInventory,
    enabled: !!tenantId,
  });
};
`
};

for (const [filePath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, filePath), content.trim() + '\n');
}

console.log('✅ Etapa 1 e 2 concluídas! API e Hooks criados isoladamente.');
