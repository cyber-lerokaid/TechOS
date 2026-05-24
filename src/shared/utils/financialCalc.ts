import type { ServiceOrder } from '@/data/mock-data';

export interface FinancialSummary {
  receita_servicos: number;
  receita_pecas: number;
  receita_total: number;
  custo_pecas: number; // calculado do mock de produtos
  lucro_estimado: number;
  ticket_medio: number;
  os_fechadas: number;
  variacao_percentual: number; // comparação com período anterior
}

export const calcularFinanceiro = (
  orders: ServiceOrder[],
  period: string
): FinancialSummary => {
  const now = new Date();
  
  const getDaysFromPeriod = (p: string) => {
    if (p === 'Hoje') return 1;
    if (p === '7d') return 7;
    if (p === '15d') return 15;
    if (p === '30d') return 30;
    if (p === 'Este Mês') return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return 7;
  };
  
  const days = getDaysFromPeriod(period);
  const cutoff = new Date(now.getTime() - days * 24 * 3600000);
  const prevCutoff = new Date(cutoff.getTime() - days * 24 * 3600000);

  const closedStatuses = ['pronto', 'entregue'];
  
  const currentOrders = orders.filter(os => 
    closedStatuses.includes(os.status) && new Date(os.atualizado_em) >= cutoff
  );
  
  const prevOrders = orders.filter(os =>
    closedStatuses.includes(os.status) &&
    new Date(os.atualizado_em) >= prevCutoff &&
    new Date(os.atualizado_em) < cutoff
  );

  const sumRevenue = (list: ServiceOrder[]) => ({
    servicos: list.reduce((acc, os) => acc + (os.valor_mao_obra || 0), 0),
    pecas: list.reduce((acc, os) => acc + (os.valor_pecas || 0), 0),
  });

  const current = sumRevenue(currentOrders);
  const prev = sumRevenue(prevOrders);
  const currentTotal = current.servicos + current.pecas;
  const prevTotal = prev.servicos + prev.pecas;

  const variacao = prevTotal === 0 ? 0 : ((currentTotal - prevTotal) / prevTotal) * 100;
  // Custo estimado das peças: assumir margem média de 40% sobre o valor cobrado
  const custo_pecas = current.pecas * 0.6;

  return {
    receita_servicos: current.servicos,
    receita_pecas: current.pecas,
    receita_total: currentTotal,
    custo_pecas,
    lucro_estimado: current.servicos + (current.pecas - custo_pecas),
    ticket_medio: currentOrders.length > 0 ? currentTotal / currentOrders.length : 0,
    os_fechadas: currentOrders.length,
    variacao_percentual: Math.round(variacao),
  };
};

export const getTransacoesPorPeriodo = (orders: ServiceOrder[], period: string) => {
  const now = new Date();
  const days = period === 'Hoje' ? 1 : period === '7d' ? 7 : period === '15d' ? 15 : period === 'Este Mês' ? 30 : 30;
  const cutoff = new Date(now.getTime() - days * 24 * 3600000);
  
  return orders
    .filter(os => ['pronto', 'entregue'].includes(os.status) && new Date(os.atualizado_em) >= cutoff)
    .sort((a, b) => new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime());
};
