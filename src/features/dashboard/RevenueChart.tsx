import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_DASHBOARD_METRICS } from '@/data/mock-data';
import { useAuth } from '@/app/providers/AuthContext';
import './RevenueChart.css';

const RevenueChart = () => {
  const { isDemoMode } = useAuth();
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  
  const m = isDemoMode ? MOCK_DASHBOARD_METRICS : {
    receita_mao_obra_semana: [0,0,0,0,0,0,0],
    receita_produtos_semana: [0,0,0,0,0,0,0]
  };

  const data = days.map((day, i) => ({
    name: day,
    Serviços: m.receita_mao_obra_semana[i],
    Produtos: m.receita_produtos_semana[i]
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--surface-floating)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px', boxShadow: 'var(--shadow-lg)' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: entry.color }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }}></span>
              {entry.name}: R$ {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="revenue-chart-container">
      <div className="revenue-chart-header">
        <h3>Faturamento na Semana</h3>
      </div>
      <div style={{ width: '100%', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-elevated)' }} />
            <Bar dataKey="Serviços" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="Produtos" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
