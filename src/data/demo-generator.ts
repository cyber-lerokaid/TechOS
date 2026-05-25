import { fakerPT_BR as faker } from '@faker-js/faker';
import type { ServiceOrder, Customer } from './mock-data';

export interface DemoScenario {
  customer: Customer;
  os: ServiceOrder;
}

const DISPOSITIVOS_POSSIVEIS = [
  { tipo: 'celular' as const, label: 'iPhone 14 Pro' },
  { tipo: 'celular' as const, label: 'Samsung Galaxy S23' },
  { tipo: 'notebook' as const, label: 'Dell Inspiron 15' },
  { tipo: 'notebook' as const, label: 'MacBook Air M1' },
  { tipo: 'celular' as const, label: 'Xiaomi Redmi Note 12' },
  { tipo: 'outro' as const, label: 'PlayStation 5' },
];

const CONTEXTOS = [
  "Começou a apresentar problema ontem",
  "Parou de funcionar de repente",
  "Após uma queda recente",
  "Depois de uma atualização",
  "Já vem apresentando falhas há alguns dias",
  "O cliente relatou que o aparelho",
  "Celular caiu recentemente e desde então"
];

const SINTOMAS = [
  "não liga",
  "não carrega",
  "fica reiniciando",
  "esquenta muito mesmo sem estar rodando nada pesado",
  "a tela não responde em algumas partes",
  "desliga sozinho após alguns minutos de uso",
  "não reconhece nenhum controle"
];

const DETALHES = [
  "às vezes dá sinal e depois para",
  "fica travado na tela inicial",
  "emite um leve aquecimento",
  "funciona por alguns minutos e desliga",
  "a tela pisca ocasionalmente",
  "apresenta lentidão extrema"
];

const TENTATIVAS = [
  "já tentou trocar o carregador",
  "reiniciou várias vezes",
  "testou com outro cabo, mas continua sem resposta",
  "tentou restaurar o sistema",
  "não fez nenhum teste ainda",
  "já tentou resetar, sem sucesso"
];

const gerarRelatoRealista = () => {
  const contexto = faker.helpers.arrayElement(CONTEXTOS);
  const sintoma = faker.helpers.arrayElement(SINTOMAS);
  const detalhe = faker.helpers.arrayElement(DETALHES);
  const tentativa = faker.helpers.arrayElement(TENTATIVAS);

  // Variação no tamanho do relato (nem todos precisam de todos os blocos)
  const formato = faker.number.int({ min: 1, max: 3 });

  if (formato === 1) {
    return `${contexto}. O aparelho ${sintoma} e ${detalhe}. Cliente informou que ${tentativa}.`;
  } else if (formato === 2) {
    return `O aparelho ${sintoma}. ${contexto}, e agora ${detalhe}. Já ${tentativa}.`;
  } else {
    return `${contexto}, ${sintoma}. ${detalhe.charAt(0).toUpperCase() + detalhe.slice(1)}.`;
  }
};

export const generateFullDemoScenarios = (): DemoScenario[] => {
  return Array.from({ length: 5 }, () => gerarClienteFake());
};

const gerarClienteFake = (): DemoScenario => {
  const customerId = faker.string.uuid();
  const osId = faker.string.uuid();
  
  const createdAt = faker.date.recent({ days: 3 }).toISOString();
  
  const nome = faker.person.fullName();
  const dddsPossiveis = [11, 15, 19, 21, 31, 41, 47, 51, 61, 71, 81, 85, 91, 92];
  const ddd = faker.helpers.arrayElement(dddsPossiveis);
  const numero = `9${faker.string.numeric(4)}-${faker.string.numeric(4)}`;
  const telefone = `(${ddd}) ${numero}`;
  const email = faker.datatype.boolean() ? faker.internet.email({ firstName: nome.split(' ')[0] }).toLowerCase() : null;
  
  const dispositivo = faker.helpers.arrayElement(DISPOSITIVOS_POSSIVEIS);
  const problema = gerarRelatoRealista();
  
  // Valores realistas em BRL
  const valorTotal = faker.number.int({ min: 10, max: 100 }) * 10; // ex: 150, 420, 990
  const maoObra = Math.floor(valorTotal * 0.4);
  const pecas = valorTotal - maoObra;
  
  const numero_os = faker.number.int({ min: 1000, max: 9999 }).toString();
  const hoursAgo = faker.number.int({ min: 0, max: 24 });

  const customer: Customer = {
    id: customerId,
    tenant_id: 'demo-tenant',
    nome,
    telefone,
    email,
    total_gasto: valorTotal,
    total_os: 1,
    criado_em: createdAt,
  };

  const os: ServiceOrder = {
    id: osId,
    tenant_id: 'demo-tenant',
    customer_id: customerId,
    customer_nome: nome,
    customer_telefone: telefone,
    device_id: faker.string.uuid(),
    device_label: dispositivo.label,
    device_tipo: dispositivo.tipo,
    technician_id: faker.helpers.arrayElement(['user_001', 'user_002']),
    technician_nome: faker.helpers.arrayElement(['Ricardo Souza', 'Breno Tavares']),
    numero_os,
    status: 'em_analise', // Sempre cai em "Em Análise"
    problema_relatado: problema,
    fotos_checkin: [],
    checklist_itens: [
      { label: 'Carregador', marcado: faker.datatype.boolean() },
      { label: 'Capa protetora', marcado: faker.datatype.boolean() },
    ],
    assinatura_url: `assinatura_demo_${faker.string.alphanumeric(4)}.png`,
    valor_mao_obra: maoObra,
    valor_pecas: pecas,
    aprovado_em: null,
    garantia_dias: 90,
    garantia_expira_em: null,
    criado_em: createdAt,
    atualizado_em: createdAt,
    horas_abertas: hoursAgo,
  };

  return { customer, os };
};
