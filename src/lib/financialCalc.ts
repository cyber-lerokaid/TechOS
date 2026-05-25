import type { ServiceOrder } from '@/data/mock-data';
import { MOCK_DASHBOARD_METRICS } from '@/data/mock-data';

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

// Corrigir calcularFinanceiro para modo demo:
export const calcularFinanceiro = (
  orders: ServiceOrder[],
  period: string,
  isDemoMode?: boolean
): FinancialSummary => {
  // Em modo demo com dados mockados, usar valores do MOCK diretamente
  // pois as datas dos mocks são antigas e não passam no filtro real
  if (isDemoMode && orders.length > 0) {
    const closedOrders = orders.filter(os => ['pronto', 'entregue'].includes(os.status));
    const receita_servicos = closedOrders.reduce((acc, os) => acc + (os.valorMaoObra || 0), 0);
    const receita_pecas = closedOrders.reduce((acc, os) => acc + (os.valorPecas || 0), 0);
    const receita_total = receita_servicos + receita_pecas;
    const custo_pecas = receita_pecas * 0.60;
    return {
      receita_servicos,
      receita_pecas,
      receita_total,
      custo_pecas,
      lucro_estimado: receita_servicos + (receita_pecas - custo_pecas),
      ticket_medio: closedOrders.length > 0 ? receita_total / closedOrders.length : 0,
      os_fechadas: closedOrders.length,
      variacao_percentual: 12, // variação positiva simulada para demo
    };
  }

  // Lógica original para conta real (com filtro de data real)
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
    closedStatuses.includes(os.status) && new Date(os.atualizadoEm) >= cutoff
  );
  const prevOrders = orders.filter(os =>
    closedStatuses.includes(os.status) &&
    new Date(os.atualizadoEm) >= prevCutoff &&
    new Date(os.atualizadoEm) < cutoff
  );
  const sumRevenue = (list: ServiceOrder[]) => ({
    servicos: list.reduce((acc, os) => acc + (os.valorMaoObra || 0), 0),
    pecas: list.reduce((acc, os) => acc + (os.valorPecas || 0), 0),
  });
  const current = sumRevenue(currentOrders);
  const prev = sumRevenue(prevOrders);
  const currentTotal = current.servicos + current.pecas;
  const prevTotal = prev.servicos + prev.pecas;
  const variacao = prevTotal === 0 ? 0 : ((currentTotal - prevTotal) / prevTotal) * 100;
  const custo_pecas = current.pecas * 0.60;
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

// NOVA FUNÇÃO — dados para o gráfico de barras
export const calcularGraficoFaturamento = (
  orders: ServiceOrder[],
  period: 'semana' | 'mes',
  isDemoMode?: boolean
): Array<{ name: string; Serviços: number; Produtos: number }> => {
  // Em modo demo, usar dados do MOCK diretamente
  if (isDemoMode) {
    const m = MOCK_DASHBOARD_METRICS;
    if (period === 'semana') {
      const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      return dias.map((name, i) => ({
        name,
        Serviços: m.receita_mao_obra_semana[i] || 0,
        Produtos: m.receita_produtos_semana[i] || 0,
      }));
    } else {
      // Mês: agregar em 4 semanas
      return ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map((name, i) => ({
        name,
        Serviços: [1200, 980, 1450, 870][i],
        Produtos: [640, 820, 590, 1100][i],
      }));
    }
  }

  // Conta real: calcular a partir das OS reais
  const now = new Date();
  const closedStatuses = ['pronto', 'entregue'];

  if (period === 'semana') {
    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(now);
      dia.setDate(now.getDate() - (6 - i));
      const diaStr = dia.toLocaleDateString('pt-BR', { weekday: 'short' });
      const diaInicio = new Date(dia); diaInicio.setHours(0, 0, 0, 0);
      const diaFim = new Date(dia); diaFim.setHours(23, 59, 59, 999);
      const dayOrders = orders.filter(os =>
        closedStatuses.includes(os.status) &&
        new Date(os.atualizadoEm) >= diaInicio &&
        new Date(os.atualizadoEm) <= diaFim
      );
      return {
        name: diaStr,
        Serviços: dayOrders.reduce((acc, os) => acc + (os.valorMaoObra || 0), 0),
        Produtos: dayOrders.reduce((acc, os) => acc + (os.valorPecas || 0), 0),
      };
    });
  } else {
    // Mês: últimas 4 semanas
    return Array.from({ length: 4 }, (_, i) => {
      const semFim = new Date(now); semFim.setDate(now.getDate() - i * 7);
      const semInicio = new Date(semFim); semInicio.setDate(semFim.getDate() - 6);
      semInicio.setHours(0, 0, 0, 0); semFim.setHours(23, 59, 59, 999);
      const semOrders = orders.filter(os =>
        closedStatuses.includes(os.status) &&
        new Date(os.atualizadoEm) >= semInicio &&
        new Date(os.atualizadoEm) <= semFim
      );
      return {
        name: `Sem ${4 - i}`,
        Serviços: semOrders.reduce((acc, os) => acc + (os.valorMaoObra || 0), 0),
        Produtos: semOrders.reduce((acc, os) => acc + (os.valorPecas || 0), 0),
      };
    }).reverse();
  }
};

// Manter getTransacoesPorPeriodo com correção para demo
export const getTransacoesPorPeriodo = (orders: ServiceOrder[], period: string, isDemoMode?: boolean) => {
  if (isDemoMode) {
    // Em demo, retornar todas as OS fechadas sem filtro de data
    return orders
      .filter(os => ['pronto', 'entregue'].includes(os.status))
      .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime());
  }
  const now = new Date();
  const days = period === 'Hoje' ? 1 : period === '7d' ? 7 : period === '15d' ? 15 : 30;
  const cutoff = new Date(now.getTime() - days * 24 * 3600000);
  return orders
    .filter(os => ['pronto', 'entregue'].includes(os.status) && new Date(os.atualizadoEm) >= cutoff)
    .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime());
};
