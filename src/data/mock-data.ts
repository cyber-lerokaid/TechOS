// src/data/mock-data.ts
// Arquivo central de dados mockados para o TechOS
// Substitua cada objeto pela chamada de API correspondente na integração real

// ============================================================
// TIPOS
// ============================================================

export type TenantPlan = "starter" | "pro" | "enterprise";
export type UserRole = "owner" | "technician" | "admin_saas";
export type DeviceType = "notebook" | "celular" | "desktop" | "tablet" | "outro";
export type OSStatus =
  | "checkin"
  | "orcamento_enviado"
  | "orcamento_aprovado"
  | "orcamento_recusado"
  | "em_analise"
  | "aguardando_peca"
  | "em_bancada"
  | "pronto"
  | "entregue";
export type PaymentMethod = "dinheiro" | "pix" | "cartao_debito" | "cartao_credito";
export type QuoteType = "orcamento_inicial" | "upgrade";
export type QuoteStatus = "pendente" | "aprovado" | "recusado";
export type MessageStatus = "enviado" | "entregue" | "lido" | "falhou";

// ============================================================
// TENANT
// ============================================================

export interface Tenant {
  id: string;
  nome_loja: string;
  slug: string;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  telefone: string;
  endereco: string;
  plano: TenantPlan;
  ativo: boolean;
  criado_em: string;
}

export const MOCK_TENANT: Tenant = {
  id: "tenant_001",
  nome_loja: "TecnoFix Assistência Técnica",
  slug: "tecnofix-manaus",
  logo_url: null,
  cor_primaria: "#0EA5E9",
  cor_secundaria: "#F59E0B",
  telefone: "(92) 98847-3321",
  endereco: "Rua Recife, 847 — Adrianópolis, Manaus/AM",
  plano: "pro",
  ativo: true,
  criado_em: "2024-01-15T10:00:00",
};

// ============================================================
// USUÁRIOS / TÉCNICOS
// ============================================================

export interface User {
  id: string;
  tenant_id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatar_iniciais: string;
  avatar_cor: string;
  ativo: boolean;
  criado_em: string;
}

export const MOCK_USERS: User[] = [
  {
    id: "user_001",
    tenant_id: "tenant_001",
    nome: "Ricardo Souza",
    email: "ricardo@tecnofix.com.br",
    role: "owner",
    avatar_iniciais: "RS",
    avatar_cor: "#8B5CF6",
    ativo: true,
    criado_em: "2024-01-15T10:00:00",
  },
  {
    id: "user_002",
    tenant_id: "tenant_001",
    nome: "Breno Tavares",
    email: "breno@tecnofix.com.br",
    role: "technician",
    avatar_iniciais: "BT",
    avatar_cor: "#10B981",
    ativo: true,
    criado_em: "2024-02-01T09:00:00",
  },
];

export const MOCK_LOGGED_USER = MOCK_USERS[0];

// ============================================================
// CLIENTES
// ============================================================

export interface Customer {
  id: string;
  tenant_id: string;
  nome: string;
  telefone: string;
  email: string | null;
  total_gasto: number;
  total_os: number;
  criado_em: string;
}

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "cust_001",
    tenant_id: "tenant_001",
    nome: "Carlos Ferreira",
    telefone: "(92) 99201-4837",
    email: "carlos.ferreira@gmail.com",
    total_gasto: 205.00,
    total_os: 1,
    criado_em: "2024-03-10T14:00:00",
  },
  {
    id: "cust_002",
    tenant_id: "tenant_001",
    nome: "Aline Rodrigues",
    telefone: "(92) 98734-2291",
    email: null,
    total_gasto: 300.00,
    total_os: 1,
    criado_em: "2024-05-22T11:00:00",
  },
  {
    id: "cust_003",
    tenant_id: "tenant_001",
    nome: "Marcos Almeida",
    telefone: "(92) 99654-7712",
    email: "marcosalmeida@outlook.com",
    total_gasto: 0,
    total_os: 1,
    criado_em: "2024-05-23T08:00:00",
  },
  {
    id: "cust_004",
    tenant_id: "tenant_001",
    nome: "Fernanda Lima",
    telefone: "(92) 98201-5543",
    email: "fernanda.lima@gmail.com",
    total_gasto: 490.00,
    total_os: 1,
    criado_em: "2023-11-20T16:00:00",
  },
  {
    id: "cust_005",
    tenant_id: "tenant_001",
    nome: "João Paulo Mendes",
    telefone: "(92) 99312-8801",
    email: null,
    total_gasto: 299.90,
    total_os: 1,
    criado_em: "2024-08-05T10:30:00",
  },
  {
    id: "cust_006",
    tenant_id: "tenant_001",
    nome: "Juliana Castro",
    telefone: "(92) 99122-3344",
    email: "ju.castro88@yahoo.com.br",
    total_gasto: 150.00,
    total_os: 1,
    criado_em: "2024-01-12T09:15:00",
  },
  {
    id: "cust_007",
    tenant_id: "tenant_001",
    nome: "Roberto Siqueira",
    telefone: "(92) 98877-6655",
    email: "roberto.siqueira@empresa.com",
    total_gasto: 350.00,
    total_os: 1,
    criado_em: "2023-09-01T13:45:00",
  },
  {
    id: "cust_008",
    tenant_id: "tenant_001",
    nome: "Vanessa Oliveira",
    telefone: "(92) 98111-2233",
    email: null,
    total_gasto: 120.00,
    total_os: 1,
    criado_em: "2024-05-24T10:00:00",
  },
  {
    id: "cust_009",
    tenant_id: "tenant_001",
    nome: "Empresa XPTO Ltda",
    telefone: "(92) 3322-1100",
    email: "contato@xpto.com.br",
    total_gasto: 890.00,
    total_os: 1,
    criado_em: "2023-05-10T08:30:00",
  },
  {
    id: "cust_010",
    tenant_id: "tenant_001",
    nome: "Thiago Guedes",
    telefone: "(92) 99444-5566",
    email: "thiagoguedes_99@hotmail.com",
    total_gasto: 85.00,
    total_os: 1,
    criado_em: "2024-04-18T16:20:00",
  },
];

// ============================================================
// APARELHOS
// ============================================================

export interface Device {
  id: string;
  tenant_id: string;
  customer_id: string;
  tipo: DeviceType;
  marca: string;
  modelo: string;
  numero_serie: string | null;
}

export const MOCK_DEVICES: Device[] = [
  {
    id: "dev_001",
    tenant_id: "tenant_001",
    customer_id: "cust_001",
    tipo: "notebook",
    marca: "Dell",
    modelo: "Inspiron 15 3520",
    numero_serie: "DL7X92A",
  },
  {
    id: "dev_002",
    tenant_id: "tenant_001",
    customer_id: "cust_002",
    tipo: "celular",
    marca: "Apple",
    modelo: "iPhone 13",
    numero_serie: null,
  },
  {
    id: "dev_003",
    tenant_id: "tenant_001",
    customer_id: "cust_003",
    tipo: "celular",
    marca: "Samsung",
    modelo: "Galaxy A54",
    numero_serie: "SM-A546BZKRZTO",
  },
  {
    id: "dev_004",
    tenant_id: "tenant_001",
    customer_id: "cust_004",
    tipo: "desktop",
    marca: "Customizado",
    modelo: "PC Gamer",
    numero_serie: null,
  },
  {
    id: "dev_005",
    tenant_id: "tenant_001",
    customer_id: "cust_005",
    tipo: "notebook",
    marca: "Lenovo",
    modelo: "IdeaPad 3i",
    numero_serie: "LNV2024X1",
  },
];

// ============================================================
// ORDENS DE SERVIÇO
// ============================================================

export interface ServiceOrder {
  id: string;
  tenantId: string;
  customerId: string;
  customerNome: string;
  customerTelefone: string;
  deviceId: string;
  deviceLabel: string;
  deviceTipo: DeviceType;
  technicianId: string;
  technicianNome: string;
  numeroOs: string;
  status: OSStatus;
  problemaRelatado: string;
  fotosCheckin: string[];
  checklistItens: ChecklistItem[];
  assinaturaUrl: string | null;
  valorMaoObra: number | null;
  valorPecas: number | null;
  aprovadoEm: string | null;
  garantiaDias: number;
  garantiaExpiraEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
  horasAbertas: number;
}

export interface ChecklistItem {
  label: string;
  marcado: boolean;
}

export const MOCK_SERVICE_ORDERS: any[] = [
  {
    id: "os_001",
    tenant_id: "tenant_001",
    customer_id: "cust_001",
    device_id: "dev_001",
    device_label: "Dell Inspiron 15 3520",
    device_tipo: "notebook",
    technician_id: "user_002",
    technician_nome: "Breno Tavares",
    numero_os: "0047",
    status: "em_bancada",
    problema_relatado: "Não liga, bateria não carrega mesmo conectado na tomada.",
    fotos_checkin: [],
    checklist_itens: [
      { label: "Carregador", marcado: true },
      { label: "Capa protetora", marcado: false },
      { label: "Caixa original", marcado: false },
      { label: "Memória externa", marcado: false },
    ],
    assinatura_url: "assinatura_os001.png",
    valor_mao_obra: 120.00,
    valor_pecas: 85.00,
    aprovado_em: "2025-05-21T10:30:00",
    garantia_dias: 90,
    garantia_expira_em: null,
    criado_em: "2025-05-21T09:14:00",
    atualizado_em: "2025-05-21T10:30:00",
    horas_abertas: 26,
  },
  {
    id: "os_002",
    tenant_id: "tenant_001",
    customer_id: "cust_002",
    device_id: "dev_002",
    device_label: "Apple iPhone 13",
    device_tipo: "celular",
    technician_id: "user_002",
    technician_nome: "Breno Tavares",
    numero_os: "0048",
    status: "aguardando_peca",
    problema_relatado: "Tela trincada após queda, touch não responde no canto inferior.",
    fotos_checkin: [],
    checklist_itens: [
      { label: "Carregador", marcado: false },
      { label: "Capa protetora", marcado: true },
      { label: "Caixa original", marcado: false },
      { label: "Memória externa", marcado: false },
    ],
    assinatura_url: "assinatura_os002.png",
    valor_mao_obra: 80.00,
    valor_pecas: 220.00,
    aprovado_em: "2025-05-22T13:00:00",
    garantia_dias: 90,
    garantia_expira_em: null,
    criado_em: "2025-05-22T11:30:00",
    atualizado_em: "2025-05-22T13:00:00",
    horas_abertas: 10,
  },
  {
    id: "os_003",
    tenant_id: "tenant_001",
    customer_id: "cust_003",
    device_id: "dev_003",
    device_label: "Samsung Galaxy A54",
    device_tipo: "celular",
    technician_id: "user_001",
    technician_nome: "Ricardo Souza",
    numero_os: "0049",
    status: "em_analise",
    problema_relatado: "Câmera não abre, aplicativo trava na inicialização.",
    fotos_checkin: [],
    checklist_itens: [
      { label: "Carregador", marcado: true },
      { label: "Capa protetora", marcado: true },
      { label: "Caixa original", marcado: false },
      { label: "Memória externa", marcado: true },
    ],
    assinatura_url: "assinatura_os003.png",
    valor_mao_obra: null,
    valor_pecas: null,
    aprovado_em: null,
    garantia_dias: 90,
    garantia_expira_em: null,
    criado_em: "2025-05-23T08:05:00",
    atualizado_em: "2025-05-23T08:05:00",
    horas_abertas: 2,
  },
  {
    id: "os_004",
    tenant_id: "tenant_001",
    customer_id: "cust_004",
    device_id: "dev_004",
    device_label: "PC Gamer Customizado",
    device_tipo: "desktop",
    technician_id: "user_001",
    technician_nome: "Ricardo Souza",
    numero_os: "0046",
    status: "pronto",
    problema_relatado: "Tela azul na inicialização, possível problema no HD ou memória RAM.",
    fotos_checkin: [],
    checklist_itens: [
      { label: "Carregador", marcado: false },
      { label: "Capa protetora", marcado: false },
      { label: "Caixa original", marcado: false },
      { label: "Memória externa", marcado: false },
    ],
    assinatura_url: "assinatura_os004.png",
    valor_mao_obra: 150.00,
    valor_pecas: 340.00,
    aprovado_em: "2025-05-20T15:00:00",
    garantia_dias: 90,
    garantia_expira_em: null,
    criado_em: "2025-05-20T14:22:00",
    atualizado_em: "2025-05-22T17:30:00",
    horas_abertas: 42,
  },
  {
    id: "os_005",
    tenant_id: "tenant_001",
    customer_id: "cust_005",
    device_id: "dev_005",
    device_label: "Lenovo IdeaPad 3i",
    device_tipo: "notebook",
    technician_id: "user_002",
    technician_nome: "Breno Tavares",
    numero_os: "0045",
    status: "orcamento_enviado",
    problema_relatado: "Notebook muito lento, demora 10 minutos para ligar.",
    fotos_checkin: [],
    checklist_itens: [
      { label: "Carregador", marcado: true },
      { label: "Capa protetora", marcado: false },
      { label: "Caixa original", marcado: false },
      { label: "Memória externa", marcado: false },
    ],
    assinatura_url: "assinatura_os005.png",
    valor_mao_obra: 80.00,
    valor_pecas: 219.90,
    aprovado_em: null,
    garantia_dias: 90,
    garantia_expira_em: null,
    criado_em: "2025-05-23T07:30:00",
    atualizado_em: "2025-05-23T08:00:00",
    horas_abertas: 3,
  },
  {
    id: "os_006",
    tenant_id: "tenant_001",
    customer_id: "cust_006",
    device_id: "dev_006",
    device_label: "Tablet Samsung Tab A",
    device_tipo: "tablet",
    technician_id: "user_001",
    technician_nome: "Ricardo Souza",
    numero_os: "0050",
    status: "em_bancada",
    problema_relatado: "Bateria descarrega muito rápido",
    fotos_checkin: [],
    checklist_itens: [{ label: "Carregador", marcado: false }],
    assinatura_url: null,
    valor_mao_obra: 50.00,
    valor_pecas: 100.00,
    aprovado_em: "2025-05-24T10:00:00",
    garantia_dias: 30,
    garantia_expira_em: null,
    criado_em: "2025-05-24T09:00:00",
    atualizado_em: "2025-05-24T10:30:00",
    horas_abertas: 5,
  },
  {
    id: "os_007",
    tenant_id: "tenant_001",
    customer_id: "cust_007",
    device_id: "dev_007",
    device_label: "Notebook Acer Nitro 5",
    device_tipo: "notebook",
    technician_id: "user_002",
    technician_nome: "Breno Tavares",
    numero_os: "0051",
    status: "aguardando_peca",
    problema_relatado: "Teclado parou de funcionar e faz barulho na ventoinha",
    fotos_checkin: [],
    checklist_itens: [{ label: "Carregador", marcado: true }],
    assinatura_url: null,
    valor_mao_obra: 150.00,
    valor_pecas: 200.00,
    aprovado_em: "2025-05-22T14:00:00",
    garantia_dias: 90,
    garantia_expira_em: null,
    criado_em: "2025-05-22T13:00:00",
    atualizado_em: "2025-05-22T14:30:00",
    horas_abertas: 48,
  },
  {
    id: "os_008",
    tenant_id: "tenant_001",
    customer_id: "cust_008",
    device_id: "dev_008",
    device_label: "iPhone 11",
    device_tipo: "celular",
    technician_id: "user_001",
    technician_nome: "Ricardo Souza",
    numero_os: "0052",
    status: "pronto",
    problema_relatado: "Troca de tela",
    fotos_checkin: [],
    checklist_itens: [{ label: "Carregador", marcado: false }],
    assinatura_url: null,
    valor_mao_obra: 50.00,
    valor_pecas: 70.00,
    aprovado_em: "2025-05-23T11:00:00",
    garantia_dias: 90,
    garantia_expira_em: null,
    criado_em: "2025-05-23T10:00:00",
    atualizado_em: "2025-05-23T16:00:00",
    horas_abertas: 24,
  },
  {
    id: "os_009",
    tenant_id: "tenant_001",
    customer_id: "cust_009",
    device_id: "dev_009",
    device_label: "Macbook Pro 2021",
    device_tipo: "notebook",
    technician_id: "user_002",
    technician_nome: "Breno Tavares",
    numero_os: "0053",
    status: "em_analise",
    problema_relatado: "Não reconhece disco rígido",
    fotos_checkin: [],
    checklist_itens: [{ label: "Carregador", marcado: true }],
    assinatura_url: null,
    valor_mao_obra: 200.00,
    valor_pecas: 690.00,
    aprovado_em: null,
    garantia_dias: 90,
    garantia_expira_em: null,
    criado_em: "2025-05-24T14:00:00",
    atualizado_em: "2025-05-24T14:00:00",
    horas_abertas: 2,
  },
  {
    id: "os_010",
    tenant_id: "tenant_001",
    customer_id: "cust_010",
    device_id: "dev_010",
    device_label: "Xiaomi Redmi Note 12",
    device_tipo: "celular",
    technician_id: "user_001",
    technician_nome: "Ricardo Souza",
    numero_os: "0054",
    status: "entregue",
    problema_relatado: "Conector USB com mau contato",
    fotos_checkin: [],
    checklist_itens: [{ label: "Carregador", marcado: true }],
    assinatura_url: null,
    valor_mao_obra: 60.00,
    valor_pecas: 25.00,
    aprovado_em: "2025-05-20T10:00:00",
    garantia_dias: 90,
    garantia_expira_em: null,
    criado_em: "2025-05-20T09:00:00",
    atualizado_em: "2025-05-21T15:00:00",
    horas_abertas: 30,
  }
];

// ============================================================
// HISTÓRICO DE STATUS
// ============================================================

export interface StatusHistory {
  id: string;
  osId: string;
  statusAnterior: OSStatus | null;
  statusNovo: OSStatus;
  notaInterna: string | null;
  notaPublica: string | null;
  changedByNome: string;
  criadoEm: string;
}

export const MOCK_STATUS_HISTORY: any[] = [
  {
    id: "hist_001",
    os_id: "os_001",
    status_anterior: null,
    status_novo: "checkin",
    nota_interna: null,
    nota_publica: "Aparelho recebido na loja.",
    changed_by_nome: "Breno Tavares",
    criado_em: "2025-05-21T09:14:00",
  },
  {
    id: "hist_002",
    os_id: "os_001",
    status_anterior: "checkin",
    status_novo: "orcamento_enviado",
    nota_interna: "Conector de carga danificado, precisa trocar.",
    nota_publica: "Diagnóstico concluído. Orçamento enviado para aprovação.",
    changed_by_nome: "Breno Tavares",
    criado_em: "2025-05-21T10:00:00",
  },
  {
    id: "hist_003",
    os_id: "os_001",
    status_anterior: "orcamento_enviado",
    status_novo: "em_bancada",
    nota_interna: null,
    nota_publica: "Orçamento aprovado! Seu aparelho já está sendo consertado.",
    changed_by_nome: "Breno Tavares",
    criado_em: "2025-05-21T10:30:00",
  }
];

// ============================================================
// PRODUTOS
// ============================================================

export interface Product {
  id: string;
  tenant_id: string;
  nome: string;
  categoria: DeviceType | "acessorio" | "outro";
  sku: string;
  preco_custo: number;
  preco_venda: number;
  quantidade_estoque: number;
  estoque_minimo?: number;
  desconto_vitrine?: number;
  foto_url: string | null;
  estoque_critico: boolean;
  ativo: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_001",
    tenant_id: "tenant_001",
    nome: "Carregador Turbo USB-C 65W",
    categoria: "notebook",
    sku: "CAR-USBC-65W",
    preco_custo: 38.00,
    preco_venda: 89.90,
    quantidade_estoque: 7,
    foto_url: null,
    desconto_vitrine: 10,
    estoque_critico: false,
    ativo: true,
  },
  {
    id: "prod_002",
    tenant_id: "tenant_001",
    nome: "Mouse Sem Fio Logitech M170",
    categoria: "notebook",
    sku: "MOU-LOG-M170",
    preco_custo: 31.00,
    preco_venda: 69.90,
    quantidade_estoque: 12,
    foto_url: null,
    
    estoque_critico: false,
    ativo: true,
  },
  {
    id: "prod_003",
    tenant_id: "tenant_001",
    nome: "Película 3D iPhone 13",
    categoria: "celular",
    sku: "PEL-IPH13-3D",
    preco_custo: 8.50,
    preco_venda: 29.90,
    quantidade_estoque: 23,
    foto_url: null,
    
    estoque_critico: false,
    ativo: true,
  },
  {
    id: "prod_004",
    tenant_id: "tenant_001",
    nome: "Cabo USB-C para Lightning 1m",
    categoria: "celular",
    sku: "CAB-USBC-LTNG",
    preco_custo: 14.00,
    preco_venda: 39.90,
    quantidade_estoque: 3,
    foto_url: null,
    
    estoque_critico: true,
    ativo: true,
  },
  {
    id: "prod_005",
    tenant_id: "tenant_001",
    nome: "SSD 480GB Kingston A400",
    categoria: "desktop",
    sku: "SSD-KNG-480",
    preco_custo: 142.00,
    preco_venda: 219.90,
    quantidade_estoque: 5,
    foto_url: null,
    
    estoque_critico: false,
    ativo: true,
  },
  {
    id: "prod_006",
    tenant_id: "tenant_001",
    nome: "Memória RAM 8GB DDR4 2666MHz",
    categoria: "desktop",
    sku: "RAM-8GB-DDR4",
    preco_custo: 89.00,
    preco_venda: 159.90,
    quantidade_estoque: 4,
    foto_url: null,
    
    estoque_critico: false,
    ativo: true,
  },
  {
    id: "prod_007",
    tenant_id: "tenant_001",
    nome: "Fone Bluetooth JBL Tune 510BT",
    categoria: "acessorio",
    sku: "FON-JBL-510BT",
    preco_custo: 98.00,
    preco_venda: 189.90,
    quantidade_estoque: 2,
    foto_url: null,
    desconto_vitrine: 15,
    estoque_critico: true,
    ativo: true,
  },
  {
    id: "prod_008",
    tenant_id: "tenant_001",
    nome: "Pasta Térmica Implastec 3g",
    categoria: "outro",
    sku: "PAS-IMP-3G",
    preco_custo: 4.50,
    preco_venda: 14.90,
    quantidade_estoque: 31,
    foto_url: null,
    
    estoque_critico: false,
    ativo: true,
  },
];

// ============================================================
// MÉTRICAS DO DASHBOARD
// ============================================================

export interface DashboardMetrics {
  os_abertas_hoje: number;
  os_prontas_retirada: number;
  faturamento_dia: number;
  ticket_medio: number;
  faturamento_semana: number[];
  receita_mao_obra_semana: number[];
  receita_produtos_semana: number[];
  dias_semana: string[];
  os_por_status: Record<OSStatus, number>;
}

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  os_abertas_hoje: 3,
  os_prontas_retirada: 1,
  faturamento_dia: 1247.50,
  ticket_medio: 311.87,
  faturamento_semana: [820, 1340, 950, 1100, 1247, 0, 0],
  receita_mao_obra_semana: [320, 540, 350, 460, 500, 0, 0],
  receita_produtos_semana: [500, 800, 600, 640, 747, 0, 0],
  dias_semana: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  os_por_status: {
    checkin: 0,
    orcamento_enviado: 1,
    orcamento_aprovado: 0,
    orcamento_recusado: 0,
    em_analise: 1,
    aguardando_peca: 1,
    em_bancada: 1,
    pronto: 1,
    entregue: 14,
  },
};

// ============================================================
// HELPERS
// ============================================================

export const STATUS_CONFIG: Record<OSStatus, { label: string; cor: string; ordem: number }> = {
  checkin:              { label: "Check-in",           cor: "#6B7280", ordem: 0 },
  orcamento_enviado:    { label: "Orçamento Enviado",   cor: "#8B5CF6", ordem: 1 },
  orcamento_aprovado:   { label: "Orçamento Aprovado",  cor: "#0EA5E9", ordem: 2 },
  orcamento_recusado:   { label: "Orçamento Recusado",  cor: "#EF4444", ordem: 2 },
  em_analise:           { label: "Em Análise",          cor: "#0EA5E9", ordem: 3 },
  aguardando_peca:      { label: "Aguardando Peça",     cor: "#F59E0B", ordem: 4 },
  em_bancada:           { label: "Em Bancada",          cor: "#06B6D4", ordem: 5 },
  pronto:               { label: "Pronto p/ Retirada",  cor: "#22C55E", ordem: 6 },
  entregue:             { label: "Entregue",            cor: "#6B7280", ordem: 7 },
};

export const DEVICE_CONFIG: Record<DeviceType, { label: string; icone: string }> = {
  notebook: { label: "Notebook", icone: "laptop" },
  celular:  { label: "Celular",  icone: "smartphone" },
  desktop:  { label: "Desktop",  icone: "monitor" },
  tablet:   { label: "Tablet",   icone: "tablet" },
  outro:    { label: "Outro",    icone: "cpu" },
};

export const formatBRL = (value: number): string =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatPhone = (phone: string): string =>
  phone.replace(/\D/g, "").replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");

export const getOSByStatus = (status: OSStatus): ServiceOrder[] =>
  MOCK_SERVICE_ORDERS.filter((os) => os.status === status);

export const getProductsByCategory = (categoria: string): Product[] =>
  MOCK_PRODUCTS.filter((p) => p.categoria === categoria && p.ativo);

export const getCriticalStock = (): Product[] =>
  MOCK_PRODUCTS.filter((p) => p.estoque_critico && p.ativo);

export const getCustomerById = (id: string): Customer | undefined =>
  MOCK_CUSTOMERS.find((c) => c.id === id);

export const getTechnicianById = (id: string): User | undefined =>
  MOCK_USERS.find((u) => u.id === id);
