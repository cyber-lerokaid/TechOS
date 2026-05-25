import MetricCardComponent from '@/features/dashboard/MetricCardComponent';
import CriticalStockWidget from '@/features/dashboard/CriticalStockWidget';
import RevenueChart from '@/features/dashboard/RevenueChart';
import KanbanBoard from '@/features/dashboard/KanbanBoard';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/app/providers/AuthContext';
import { MOCK_DASHBOARD_METRICS } from '@/data/mock-data';
import { Clock, CheckCircle2, DollarSign, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import './Dashboard.css';

const Dashboard = () => {
  const { isDemoMode } = useAuth();
  
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  
  const m = isDemoMode ? MOCK_DASHBOARD_METRICS : {
    os_abertas_hoje: 0,
    os_prontas_retirada: 0,
    faturamento_dia: 0,
    ticket_medio: 0
  };

  const metrics = [
    {
      id: 'm1',
      title: 'OS Abertas Hoje',
      value: m.os_abertas_hoje,
      type: 'number' as const,
      icon: Clock,
      trend: { value: 2, isPositive: true }
    },
    {
      id: 'm2',
      title: 'Prontas p/ Retirada',
      value: m.os_prontas_retirada,
      type: 'number' as const,
      icon: CheckCircle2,
      alert: m.os_prontas_retirada > 0
    },
    {
      id: 'm3',
      title: 'Faturamento do Dia',
      value: m.faturamento_dia,
      type: 'currency' as const,
      icon: DollarSign,
      trend: { value: 150, isPositive: true }
    },
    {
      id: 'm4',
      title: 'Ticket Médio',
      value: m.ticket_medio,
      type: 'currency' as const,
      icon: Activity
    }
  ];

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
            <div key={metric.id}>
              <MetricCardComponent metric={metric} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 overflow-visible min-h-[420px]">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-visible">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-sm text-white/70 font-semibold tracking-wide uppercase">Ordens de Serviço</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Filtrar</Button>
              </div>
            </div>
            <div className="flex-1 overflow-visible">
              <KanbanBoard />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1 pb-10">
            <CriticalStockWidget />
            <RevenueChart />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
