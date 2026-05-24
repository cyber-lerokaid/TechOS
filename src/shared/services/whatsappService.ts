import { supabase } from '@/shared/lib/supabase';
import type { ServiceOrder } from '@/data/mock-data';

interface SendMessageParams {
  tenantId: string;
  phone: string;
  message: string;
  messageType: WhatsAppMessageType;
  osId?: string;
}

export type WhatsAppMessageType =
  | 'checkin'
  | 'status_update'
  | 'orcamento'
  | 'orcamento_aprovado'
  | 'pronto'
  | 'reativacao'
  | 'teste';

// ─── Função base de envio ────────────────────────────────────

export const sendWhatsAppMessage = async (params: SendMessageParams): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        tenant_id: params.tenantId,
        phone: params.phone,
        message: params.message,
        message_type: params.messageType,
        os_id: params.osId,
      },
    });

    if (error) return { success: false, error: error.message };
    return data;
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ─── Mensagens tipadas ────────────────────────────────────────

export const notifyCheckin = async (
  tenantId: string,
  os: ServiceOrder,
  nomeLoja: string,
  publicBaseUrl: string
) => {
  const message =
    `Olá, *${os.customer_nome}*! 👋\n\n` +
    `Seu *${os.device_label}* foi recebido com sucesso pela *${nomeLoja}*.\n\n` +
    `📋 *OS #${os.numero_os}*\n` +
    `🔧 Problema relatado: ${os.problema_relatado}\n\n` +
    `Acompanhe o andamento do conserto em tempo real pelo link abaixo:\n` +
    `👉 ${publicBaseUrl}/os/${os.numero_os}\n\n` +
    `Qualquer dúvida, é só responder esta mensagem. 😊`;

  return sendWhatsAppMessage({
    tenantId,
    phone: os.customer_telefone,
    message,
    messageType: 'checkin',
    osId: os.id,
  });
};

export const notifyStatusUpdate = async (
  tenantId: string,
  os: ServiceOrder,
  novoStatus: string,
  publicBaseUrl: string
) => {
  const statusMessages: Record<string, string> = {
    em_analise: `🔍 Seu aparelho está sendo analisado pelo nosso técnico. Em breve traremos novidades!`,
    aguardando_peca: `⏳ Identificamos o problema! Estamos aguardando a chegada da peça necessária para concluir o reparo.`,
    em_bancada: `🔧 Ótimas notícias! Seu *${os.device_label}* já está na bancada sendo consertado.`,
    pronto: `✅ *Seu aparelho está pronto para retirada!*\n\nPasse na loja no horário de funcionamento. Não esqueça de trazer este comprovante.`,
    entregue: `🎉 Obrigado pela preferência, *${os.customer_nome}*! Esperamos ter te atendido bem. Em caso de dúvidas sobre a garantia, é só nos chamar.`,
  };

  const statusText = statusMessages[novoStatus] || `Status atualizado para: ${novoStatus}`;

  const message =
    `Olá, *${os.customer_nome}*! 📱\n\n` +
    `Atualização da sua *OS #${os.numero_os}* — *${os.device_label}*:\n\n` +
    `${statusText}\n\n` +
    `Acompanhe pelo link: ${publicBaseUrl}/os/${os.numero_os}`;

  return sendWhatsAppMessage({
    tenantId,
    phone: os.customer_telefone,
    message,
    messageType: 'status_update',
    osId: os.id,
  });
};

export const notifyOrcamento = async (
  tenantId: string,
  os: ServiceOrder,
  valorMaoObra: number,
  valorPecas: number,
  observacoes: string,
  publicBaseUrl: string
) => {
  const total = valorMaoObra + valorPecas;
  const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const message =
    `Olá, *${os.customer_nome}*! 💰\n\n` +
    `O diagnóstico do seu *${os.device_label}* foi concluído.\n\n` +
    `📋 *Orçamento OS #${os.numero_os}*\n` +
    `🔧 Mão de obra: *${formatBRL(valorMaoObra)}*\n` +
    `🔩 Peças: *${formatBRL(valorPecas)}*\n` +
    `💵 *Total: ${formatBRL(total)}*\n\n` +
    (observacoes ? `📝 ${observacoes}\n\n` : '') +
    `Para *aprovar ou recusar* o orçamento, acesse:\n` +
    `👉 ${publicBaseUrl}/os/${os.numero_os}\n\n` +
    `O orçamento é válido por 5 dias úteis.`;

  return sendWhatsAppMessage({
    tenantId,
    phone: os.customer_telefone,
    message,
    messageType: 'orcamento',
    osId: os.id,
  });
};

export const notifyReativacao = async (
  tenantId: string,
  customerPhone: string,
  customerNome: string,
  nomeLoja: string
) => {
  const message =
    `Olá, *${customerNome}*! 👋\n\n` +
    `Faz um tempinho que você não aparece por aqui na *${nomeLoja}*.\n\n` +
    `Está tudo bem com seu aparelho? 📱\n\n` +
    `Se precisar de qualquer assistência técnica, conte com a gente! Temos ótimas condições e atendimento rápido.\n\n` +
    `É só responder esta mensagem ou nos ligar. 😊`;

  return sendWhatsAppMessage({
    tenantId,
    phone: customerPhone,
    message,
    messageType: 'reativacao',
  });
};
