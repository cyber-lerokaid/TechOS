import type { ServiceOrder, Customer } from './mock-data';

export interface DemoScenario {
  customer: Customer;
  os: ServiceOrder;
  consumed_product?: string; // id do produto consumido
}

const TECH_PROBLEMS = [
  {
    device_tipo: 'celular' as const,
    device_label: 'Samsung Galaxy S23',
    problema: 'Tela trincada após queda, touch não responde no canto inferior direito.',
    status: 'aguardando_peca' as const,
    valor_mao_obra: 80,
    valor_pecas: 180,
    technician_nome: 'Breno Tavares',
    technician_id: 'user_002',
    checklist: [
      { label: 'Carregador', marcado: true },
      { label: 'Capa protetora', marcado: true },
      { label: 'Caixa original', marcado: false },
      { label: 'Memória externa', marcado: false },
    ]
  },
  {
    device_tipo: 'notebook' as const,
    device_label: 'Dell Inspiron 15 3520',
    problema: 'Notebook extremamente lento, demora 15 minutos para inicializar. HD provavelmente falhando.',
    status: 'em_bancada' as const,
    valor_mao_obra: 120,
    valor_pecas: 219.90,
    technician_nome: 'Ricardo Souza',
    technician_id: 'user_001',
    checklist: [
      { label: 'Carregador', marcado: true },
      { label: 'Capa protetora', marcado: false },
      { label: 'Caixa original', marcado: false },
      { label: 'Memória externa', marcado: false },
    ]
  },
  {
    device_tipo: 'desktop' as const,
    device_label: 'PC Gamer Customizado',
    problema: 'Tela azul na inicialização (BSOD). Suspeita de falha na memória RAM ou HD corrompido.',
    status: 'em_analise' as const,
    valor_mao_obra: null,
    valor_pecas: null,
    technician_nome: 'Ricardo Souza',
    technician_id: 'user_001',
    checklist: [
      { label: 'Carregador', marcado: false },
      { label: 'Capa protetora', marcado: false },
      { label: 'Caixa original', marcado: false },
      { label: 'Memória externa', marcado: true },
    ]
  },
  {
    device_tipo: 'celular' as const,
    device_label: 'iPhone 14 Pro',
    problema: 'Bateria vicia rapidamente, carrega 100% mas descarrega em 2 horas. Precisa trocar a bateria.',
    status: 'pronto' as const,
    valor_mao_obra: 90,
    valor_pecas: 140,
    technician_nome: 'Breno Tavares',
    technician_id: 'user_002',
    checklist: [
      { label: 'Carregador', marcado: true },
      { label: 'Capa protetora', marcado: false },
      { label: 'Caixa original', marcado: false },
      { label: 'Memória externa', marcado: false },
    ]
  },
  {
    device_tipo: 'notebook' as const,
    device_label: 'Lenovo IdeaPad 3i',
    problema: 'Teclado com várias teclas travadas após derramar água. Necessário substituição do teclado.',
    status: 'orcamento_enviado' as const,
    valor_mao_obra: 100,
    valor_pecas: 160,
    technician_nome: 'Breno Tavares',
    technician_id: 'user_002',
    checklist: [
      { label: 'Carregador', marcado: true },
      { label: 'Capa protetora', marcado: false },
      { label: 'Caixa original', marcado: false },
      { label: 'Memória externa', marcado: false },
    ]
  },
];

const DEMO_CUSTOMERS_DATA = [
  { nome: 'Ana Clara Mendes', telefone: '(92) 99201-1123', email: 'anaclara@gmail.com' },
  { nome: 'Bruno Henrique Silva', telefone: '(92) 98734-5591', email: null },
  { nome: 'Carla Beatriz Souza', telefone: '(92) 99654-3312', email: 'carlabs@outlook.com' },
  { nome: 'Diego Ferreira Lima', telefone: '(92) 98201-7734', email: null },
  { nome: 'Eduarda Costa Rocha', telefone: '(92) 99312-9901', email: 'eduarda.rocha@gmail.com' },
];

export const generateFullDemoScenarios = (): DemoScenario[] => {
  const now = new Date();
  
  return DEMO_CUSTOMERS_DATA.map((customerData, i) => {
    const problem = TECH_PROBLEMS[i];
    const customerId = `demo_cust_${i}_${Date.now()}`;
    const osId = `demo_os_${i}_${Date.now()}`;
    const hoursAgo = [26, 10, 2, 42, 3][i];
    const createdAt = new Date(now.getTime() - hoursAgo * 3600000).toISOString();

    const customer: Customer = {
      id: customerId,
      tenant_id: 'demo-tenant',
      nome: customerData.nome,
      telefone: customerData.telefone,
      email: customerData.email,
      total_gasto: problem.valor_mao_obra && problem.valor_pecas
        ? problem.valor_mao_obra + problem.valor_pecas
        : 0,
      total_os: 1,
      criado_em: createdAt,
    };

    const os: ServiceOrder = {
      id: osId,
      tenant_id: 'demo-tenant',
      customer_id: customerId,
      customer_nome: customerData.nome,
      customer_telefone: customerData.telefone,
      device_id: `demo_dev_${i}`,
      device_label: problem.device_label,
      device_tipo: problem.device_tipo,
      technician_id: problem.technician_id,
      technician_nome: problem.technician_nome,
      numero_os: (50 + i).toString().padStart(4, '0'),
      status: problem.status,
      problema_relatado: problem.problema,
      fotos_checkin: [],
      checklist_itens: problem.checklist,
      assinatura_url: `assinatura_demo_${i}.png`,
      valor_mao_obra: problem.valor_mao_obra || null,
      valor_pecas: problem.valor_pecas || null,
      aprovado_em: problem.status !== 'em_analise' && problem.status !== 'orcamento_enviado'
        ? new Date(now.getTime() - (hoursAgo - 1) * 3600000).toISOString()
        : null,
      garantia_dias: 90,
      garantia_expira_em: null,
      criado_em: createdAt,
      atualizado_em: new Date(now.getTime() - Math.floor(hoursAgo / 2) * 3600000).toISOString(),
      horas_abertas: hoursAgo,
    };

    return { customer, os };
  });
};
