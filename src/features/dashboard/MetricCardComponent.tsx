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
      className={`metric-card ${metric.id === 'm3' ? 'highlight' : ''}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="metric-title">{metric.title}</span>
        {Icon && <Icon size={16} style={{ color: 'var(--text-muted)' }} />}
      </div>
      <div className="metric-value">{formatValue(displayValue)}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 20 }}>
        {metric.trend ? (
          <div className={`metric-trend ${metric.trend.isPositive ? 'positive' : 'negative'}`}>
            {metric.trend.isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>
              {metric.trend.isPositive ? '+' : ''}
              {metric.type === 'currency' ? formatValue(metric.trend.value) : metric.trend.value} hoje
            </span>
          </div>
        ) : <div />}
        {metric.alert && (
          <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'var(--color-warning)', opacity: 0.7,
              animation: 'ping 1.5s ease infinite',
            }} />
            <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)' }} />
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCardComponent;
