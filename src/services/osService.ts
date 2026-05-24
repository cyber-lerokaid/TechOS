import { supabase } from '../lib/supabase';
import { MOCK_SERVICE_ORDERS, MOCK_CUSTOMERS, type ServiceOrder } from '../data/mock-data';
import { generateFullDemoScenarios } from '../data/demo-generator';

const SESSION_STORAGE_KEY = 'techos_demo_orders';
const DEMO_CUSTOMERS_KEY = 'techos_demo_customers';

// Inicializa o sessionStorage com os dados mockados se estiver vazio
export const initDemoData = () => {
  const existingData = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!existingData) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(MOCK_SERVICE_ORDERS));
  }
};

export const applyDemoScenarios = () => {
  const scenarios = generateFullDemoScenarios();
  
  // Salvar OS
  const existingOs = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || '[]');
  const newOs = scenarios.map(s => s.os);
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify([...newOs, ...existingOs]));
  
  // Salvar Clientes
  const existingCustomers = JSON.parse(sessionStorage.getItem(DEMO_CUSTOMERS_KEY) || '[]');
  const newCustomers = scenarios.map(s => s.customer);
  sessionStorage.setItem(DEMO_CUSTOMERS_KEY, JSON.stringify([...newCustomers, ...existingCustomers]));
  
  // Disparar evento global para todas as páginas atualizarem
  window.dispatchEvent(new CustomEvent('demoDataGenerated'));
};

export const fetchDemoCustomers = () => {
  const base = JSON.parse(sessionStorage.getItem(DEMO_CUSTOMERS_KEY) || 'null');
  return base || MOCK_CUSTOMERS;
};

/**
 * Busca as Ordens de Serviço.
 * Se isDemoMode for true, busca do sessionStorage (persiste na aba).
 * Se falso, busca da tabela ordens_servico no Supabase.
 */
export const fetchOrdensServico = async (isDemoMode: boolean): Promise<ServiceOrder[]> => {
  if (isDemoMode) {
    initDemoData();
    const data = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } else {
    try {
      const { data, error } = await supabase
        .from('ordens_de_servico')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao buscar ordens de serviço:', error);
        return [];
      }
      return data as ServiceOrder[];
    } catch (err) {
      console.error('Erro de conexão ao buscar OS:', err);
      return [];
    }
  }
};

/**
 * Salva uma nova Ordem de Serviço.
 * Se isDemoMode for true, insere no topo do sessionStorage e emite evento.
 * Se falso, insere no Supabase e emite evento.
 */
export const saveOrdemServico = async (osData: Partial<ServiceOrder>, isDemoMode: boolean): Promise<ServiceOrder> => {
  if (isDemoMode) {
    initDemoData();
    const existingDataString = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const existingOrders: ServiceOrder[] = existingDataString ? JSON.parse(existingDataString) : [];
    
    const novaOs: ServiceOrder = {
      ...osData,
      id: `os_demo_${Date.now()}`,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    } as ServiceOrder;

    // Adiciona no topo da lista
    const newOrders = [novaOs, ...existingOrders];
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newOrders));
    
    // Dispara evento global para tabelas e kanban atualizarem
    window.dispatchEvent(new CustomEvent('osUpdated'));
    
    return novaOs;
  } else {
    const { data, error } = await supabase
      .from('ordens_de_servico')
      .insert([osData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar OS no Supabase:', error);
      throw error;
    }
    
    // Dispara evento global para tabelas e kanban atualizarem
    window.dispatchEvent(new CustomEvent('osUpdated'));
    return data as ServiceOrder;
  }
};
