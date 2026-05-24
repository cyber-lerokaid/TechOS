import MetricCardComponent from '../components/dashboard/MetricCardComponent';
import CriticalStockWidget from '../components/dashboard/CriticalStockWidget';
import RevenueChart from '../components/dashboard/RevenueChart';
import KanbanBoard from '../components/dashboard/KanbanBoard';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_DASHBOARD_METRICS } from '../data/mock-data';
import { Clock, CheckCircle2, DollarSign, Activity } from 'lucide-react';

const Dashboard = () => {
  const { isDemoMode } = useAuth();
  
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
      <div className="flex flex-col h-full gap-6 w-full">
        {/* Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {metrics.map(metric => (
            <MetricCardComponent key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex gap-6 flex-1 overflow-hidden min-h-[400px]">
          {/* Kanban */}
          <div className="flex flex-col gap-4 flex-[3] overflow-hidden">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>Ordens de Serviço</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-outline">Filtrar</button>
            </div>
          </div>
          <KanbanBoard />
        </div>

          {/* Widgets Right Side */}
          <div className="flex-1 min-w-[300px] flex flex-col gap-6 overflow-y-auto">
            <CriticalStockWidget />
            <RevenueChart />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
