import { getCriticalStock, formatBRL } from '@/data/mock-data';
import { AlertTriangle, Package } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import './CriticalStockWidget.css';

const CriticalStockWidget = () => {
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const criticalItems = isDemoMode ? getCriticalStock() : [];

  return (
    <Card className="border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-500/80" />
            <h3 className="text-[13px] font-medium text-[#e6edf3]">Estoque Crítico</h3>
          </div>
          <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-amber-500/80 text-[10px] font-medium tracking-wide uppercase">
            {criticalItems.length} itens
          </div>
        </div>
        
        <div className="flex-1">
          {criticalItems.length === 0 ? (
            <div className="empty-state-widget">
              <Package size={48} />
              <p>Seu estoque está saudável!</p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-white/[0.04]">
              {criticalItems.map(item => {
                const nivel = Math.min((item.quantidade_estoque / 5) * 100, 100);
                const isCritico = item.quantidade_estoque <= 2;
                return (
                  <li key={item.id} className="py-3 -mx-2 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0 mr-3">
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.nome}
                        </span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace' }}>
                          {item.sku}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span style={{
                          fontSize: 13, fontWeight: 700,
                          color: isCritico ? 'rgba(239,68,68,0.9)' : 'rgba(245,158,11,0.85)',
                        }}>
                          {item.quantidade_estoque} un
                        </span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)' }}>
                          {formatBRL(item.preco_venda)}
                        </span>
                      </div>
                    </div>
                    {/* Barra de nível */}
                    <div style={{
                      height: 3, background: 'rgba(255,255,255,0.06)',
                      borderRadius: 2, overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${nivel}%`,
                        background: isCritico
                          ? 'linear-gradient(90deg, #EF4444, #F87171)'
                          : 'linear-gradient(90deg, #F59E0B, #FCD34D)',
                        borderRadius: 2,
                        transition: 'width 600ms ease',
                      }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <button 
            onClick={() => navigate('/dashboard/estoque')}
            className="w-full py-1.5 rounded-lg border border-white/[0.04] hover:bg-white/[0.04] text-[#9da7b3] font-medium text-[13px] transition-colors"
          >
            Gerenciar Estoque
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CriticalStockWidget;
