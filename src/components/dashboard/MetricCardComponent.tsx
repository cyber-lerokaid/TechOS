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
    <div className={`flex flex-col gap-3 p-5 rounded-2xl border border-white/5 bg-[#1C1C25] hover:-translate-y-1 hover:border-white/10 transition-all duration-200 ${metric.id === 'm3' ? 'shadow-[0_0_30px_rgba(14,165,233,0.05)]' : ''}`}>
      <div className="flex justify-between items-center text-slate-400">
        <h3 className="text-[13px] font-semibold m-0">{metric.title}</h3>
        {Icon && <Icon size={18} className="opacity-70" />}
      </div>
      
      <div className="text-3xl font-bold text-slate-100 my-1">
        {formatValue(displayValue)}
      </div>
      
      <div className="flex items-center justify-between">
        {metric.trend ? (
          <div className={`flex items-center gap-1 text-xs font-semibold ${metric.trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metric.trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>
              {metric.trend.isPositive ? '+' : '-'}
              {metric.type === 'currency' ? formatValue(metric.trend.value) : metric.trend.value} hoje
            </span>
          </div>
        ) : (
          <div className="text-xs text-transparent select-none">-</div> // Spacer
        )}

        {metric.alert && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCardComponent;
