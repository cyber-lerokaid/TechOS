import MetricCardComponent from '@/features/dashboard/MetricCardComponent';
import CriticalStockWidget from '@/features/dashboard/CriticalStockWidget';
import RevenueChart from '@/features/dashboard/RevenueChart';
import KanbanBoard from '@/features/dashboard/KanbanBoard';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';

import { useOrderList } from '@/shared/lib/hooks/orders/useOrderList';
import { Clock, CheckCircle2, DollarSign, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/providers/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { applyDemoScenarios } from '@/lib/services/osService';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const { isDemoMode } = useAuth();
  const queryClient = useQueryClient();

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  
  const { data: allOrders = [] } = useOrderList();

  const todayDateStr = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDateStr = yesterday.toDateString();

  const osAbertasHoje = allOrders.filter((os: any) => new Date(os.criadoEm).toDateString() === todayDateStr).length;
  const osAbertasOntem = allOrders.filter((os: any) => new Date(os.criadoEm).toDateString() === yesterdayDateStr).length;
  const trendOsAbertas = osAbertasHoje - osAbertasOntem;

  const osProntas = allOrders.filter((os: any) => os.status === 'pronto').length;
  
  const faturamentoDia = allOrders
    .filter((os: any) => (os.status === 'entregue' || os.status === 'pronto') && new Date(os.atualizadoEm).toDateString() === todayDateStr)
    .reduce((acc: number, os: any) => acc + (os.valorMaoObra || 0) + (os.valorPecas || 0), 0);
    
  const faturamentoOntem = allOrders
    .filter((os: any) => (os.status === 'entregue' || os.status === 'pronto') && new Date(os.atualizadoEm).toDateString() === yesterdayDateStr)
    .reduce((acc: number, os: any) => acc + (os.valorMaoObra || 0) + (os.valorPecas || 0), 0);
  const trendFaturamento = faturamentoDia - faturamentoOntem;
    
  const concluidasHoje = allOrders.filter((os: any) => (os.status === 'entregue' || os.status === 'pronto') && new Date(os.atualizadoEm).toDateString() === todayDateStr);
  const ticketMedio = concluidasHoje.length > 0 ? faturamentoDia / concluidasHoje.length : 0;

  const metrics = [
    {
      id: 'm1',
      title: 'OS Abertas Hoje',
      value: osAbertasHoje,
      type: 'number' as const,
      icon: Clock,
      trend: { value: Math.abs(trendOsAbertas), isPositive: trendOsAbertas >= 0 }
    },
    {
      id: 'm2',
      title: 'Prontas p/ Retirada',
      value: osProntas,
      type: 'number' as const,
      icon: CheckCircle2,
      alert: osProntas > 0
    },
    {
      id: 'm3',
      title: 'Faturamento do Dia',
      value: faturamentoDia,
      type: 'currency' as const,
      icon: DollarSign,
      trend: { value: Math.abs(trendFaturamento), isPositive: trendFaturamento >= 0 }
    },
    {
      id: 'm4',
      title: 'Ticket Médio (Hoje)',
      value: ticketMedio,
      type: 'currency' as const,
      icon: Activity
    }
  ];

  const EXPLANATIONS: Record<string, { title: string; description: string }> = {
    m1: {
      title: 'OS Abertas Hoje',
      description: 'Esta métrica contabiliza o número total de Ordens de Serviço (OS) que deram entrada e foram cadastradas no sistema estritamente no dia de hoje.'
    },
    m2: {
      title: 'Prontas p/ Retirada',
      description: 'Mostra a quantidade atual de aparelhos que já foram consertados e estão aguardando o cliente vir retirar. Esta contagem ignora a data, focando apenas no status "Pronto".'
    },
    m3: {
      title: 'Faturamento do Dia',
      description: 'Representa a soma do valor total (Mão de Obra + Peças) de todas as Ordens de Serviço que mudaram para o status de "Pronto" ou "Entregue" no dia de hoje.'
    },
    m4: {
      title: 'Ticket Médio (Hoje)',
      description: 'É a média de valor gasto pelos clientes nos serviços concluídos hoje. O cálculo divide o "Faturamento do Dia" pelo número de OS que ficaram prontas hoje.'
    }
  };

  const selectedExplanation = selectedMetricId ? EXPLANATIONS[selectedMetricId] : null;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-4 w-full animate-[fadeIn_500ms_ease]">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.30)', margin: '0 0 3px', fontWeight: 500 }}>
              {saudacao} 👋
            </p>
            <h1 style={{
              fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
              margin: 0, letterSpacing: '-0.02em',
              textTransform: 'capitalize',
            }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <div 
              key={metric.id} 
              onClick={() => setSelectedMetricId(metric.id)}
              className="cursor-pointer"
            >
              <MetricCardComponent metric={metric} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 overflow-visible min-h-[420px]">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-visible">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-sm text-white/70 font-semibold tracking-wide uppercase">Ordens de Serviço</h2>
              <div className="flex gap-2">
                {isDemoMode && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="gap-2 bg-indigo-500/20 text-indigo-200 border-indigo-500/30 hover:bg-indigo-500/30"
                    onClick={() => {
                      applyDemoScenarios();
                      queryClient.invalidateQueries({ queryKey: ['orders'] });
                      queryClient.invalidateQueries({ queryKey: ['customers'] });
                      queryClient.invalidateQueries({ queryKey: ['inventory'] });
                      window.dispatchEvent(new CustomEvent('showToast', { 
                        detail: { message: '5 cenários de demonstração gerados com sucesso!', type: 'success' } 
                      }));
                    }}
                  >
                    👥 Simular 5 Clientes
                  </Button>
                )}
                <Button 
                  variant={isFiltering ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setIsFiltering(!isFiltering)}
                >
                  {isFiltering ? 'Limpar Filtros' : 'Filtrar Urgentes'}
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-visible">
              <KanbanBoard filterMode={isFiltering ? 'urgent' : 'all'} />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1 pb-10">
            <CriticalStockWidget />
            <RevenueChart />
          </div>
        </div>
      </div>

      <Modal 
        isOpen={!!selectedMetricId} 
        onClose={() => setSelectedMetricId(null)}
        title={selectedExplanation?.title}
        maxWidth="md"
      >
        <div className="text-muted-foreground leading-relaxed mt-2 text-[15px]">
          {selectedExplanation?.description}
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;
