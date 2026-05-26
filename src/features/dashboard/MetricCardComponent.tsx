import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';


export interface MetricCardType {
  id: string;
  title: string;
  value: number;
  type: 'currency' | 'number';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  alert?: boolean;
  icon?: any;
}

interface Props {
  metric: MetricCardType;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const MetricCardComponent = ({ metric }: Props) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 600;
    const startTime = performance.now();
    const endValue = metric.value;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      
      setDisplayValue(endValue * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };
    
    requestAnimationFrame(animate);
  }, [metric.value]);

  const formatValue = (val: number) => {
    if (metric.type === 'currency') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    }
    return Math.floor(val).toString();
  };

  const Icon = metric.icon;

  return (
    <div
      style={{
        background: metric.id === 'm3'
          ? 'linear-gradient(145deg, rgba(37,99,235,0.08) 0%, rgba(6,182,212,0.04) 100%)'
          : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: metric.id === 'm3'
          ? '1px solid rgba(37,99,235,0.25)'
          : '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '110px',
        transition: 'all 200ms ease',
        cursor: 'default',
        boxShadow: metric.id === 'm3'
          ? '0 0 40px rgba(37,99,235,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
          : 'inset 0 1px 0 rgba(255,255,255,0.03)',
        position: 'relative' as const,
        overflow: 'hidden',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = metric.id === 'm3' ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.10)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = metric.id === 'm3' ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.06)'; }}
    >
      {/* Linha de acento no topo para card de faturamento */}
      {metric.id === 'm3' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.6), rgba(6,182,212,0.6), transparent)',
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {metric.title}
        </span>
        {Icon && (
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: metric.id === 'm3' ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: metric.id === 'm3' ? '#60A5FA' : 'rgba(255,255,255,0.25)',
          }}>
            <Icon size={14} />
          </div>
        )}
      </div>

      <div className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-white/90 tracking-tight font-syne leading-none mt-2 truncate">
        {formatValue(displayValue)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 20, marginTop: 8 }}>
        {metric.trend ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: metric.trend.isPositive ? 'rgba(34,197,94,0.85)' : 'rgba(239,68,68,0.85)' }}>
            {metric.trend.isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>
              {metric.trend.isPositive ? '+' : ''}
              {metric.type === 'currency' ? formatValue(metric.trend.value) : metric.trend.value}
              {' '}
              <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>vs ontem</span>
            </span>
          </div>
        ) : <div />}

        {metric.alert && (
          <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(245,158,11,0.7)', animation: 'ping 1.5s ease infinite' }} />
            <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCardComponent;
