import MetricCardComponent from '@/features/dashboard/MetricCardComponent';
import CriticalStockWidget from '@/features/dashboard/CriticalStockWidget';
import RevenueChart from '@/features/dashboard/RevenueChart';
import KanbanBoard from '@/features/dashboard/KanbanBoard';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/app/providers/AuthContext';
import { MOCK_DASHBOARD_METRICS } from '@/data/mock-data';
import { Clock, CheckCircle2, DollarSign, Activity } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import './Dashboard.css';

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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px', width: '100%', animation: 'fadeIn 500ms ease' }}>
        <div className="metrics-grid">
          {metrics.map((metric) => (
            <div key={metric.id}>
              <MetricCardComponent metric={metric} />
            </div>
          ))}
        </div>

        <div className="dashboard-bottom-grid">
          <div className="kanban-section">
            <div className="section-header">
              <h2>Ordens de Serviço</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="outline" size="sm">Filtrar</Button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-card)' }}>
              <KanbanBoard />
            </div>
          </div>

          <div className="widgets-section">
            <CriticalStockWidget />
            <RevenueChart />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
