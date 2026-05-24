import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_DASHBOARD_METRICS } from '../../data/mock-data';
import { useAuth } from '../../contexts/AuthContext';
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
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, margin: 0, fontSize: '13px', fontWeight: 500 }}>
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
      <div className="revenue-chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)' }} />
            <Bar dataKey="Serviços" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Produtos" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
