import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatBRL } from '@/data/mock-data';
import { useAuth } from '@/app/providers/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { useOrderList } from '@/shared/lib/hooks/orders/useOrderList';
import { calcularGraficoFaturamento } from '@/lib/financialCalc';

const RevenueChart = () => {
  const { isDemoMode } = useAuth();
  const [period, setPeriod] = useState<'semana' | 'mes'>('semana');
  const { data: orders = [] } = useOrderList();

  // Calcular dados reais para a semana ou mês
  const data = calcularGraficoFaturamento(orders, period, isDemoMode);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(10,12,28,0.98)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '12px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{entry.name}:</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>{formatBRL(entry.value)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8, paddingTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>
            Total: {formatBRL(payload.reduce((acc: number, e: any) => acc + e.value, 0))}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Header com toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            Faturamento
          </h3>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['semana', 'mes'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: period === p ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.06)',
                  background: period === p ? 'rgba(37,99,235,0.15)' : 'transparent',
                  color: period === p ? '#93C5FD' : 'rgba(255,255,255,0.30)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  fontFamily: 'inherit',
                  textTransform: 'capitalize' as const,
                }}
              >
                {p === 'semana' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', gap: 14 }}>
          {[
            { color: '#3B82F6', label: 'Serviços' },
            { color: '#06B6D4', label: 'Produtos' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              {l.label}
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="30%">
              <defs>
                <linearGradient id="gradServicos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#1E40AF" stopOpacity={0.75} />
                </linearGradient>
                <linearGradient id="gradProdutos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.90} />
                  <stop offset="100%" stopColor="#0E7490" stopOpacity={0.70} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val >= 1000 ? `R$${(val/1000).toFixed(0)}k` : `R$${val}`}
                width={44}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.025)', radius: 4 }} />
              <Bar dataKey="Serviços" fill="url(#gradServicos)" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="Produtos" fill="url(#gradProdutos)" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
