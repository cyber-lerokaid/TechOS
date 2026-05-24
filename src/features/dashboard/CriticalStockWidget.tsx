import { getCriticalStock, formatBRL } from '@/data/mock-data';
import { AlertTriangle, Package } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CriticalStockWidget.css';

const CriticalStockWidget = () => {
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const criticalItems = isDemoMode ? getCriticalStock() : [];

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title-group">
          <AlertTriangle size={16} className="text-warning" />
          <h3>Estoque Crítico</h3>
        </div>
        <div style={{ padding: '2px 8px', borderRadius: '999px', backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--color-warning)', fontSize: '11px', fontWeight: 700 }}>
          {criticalItems.length} itens
        </div>
      </div>
      
      <div className="widget-content">
        {criticalItems.length === 0 ? (
          <div className="empty-state-widget">
            <Package size={48} />
            <p>Seu estoque está saudável!</p>
          </div>
        ) : (
          <ul className="stock-list">
            {criticalItems.map(item => (
              <li key={item.id} className="stock-item">
                <div className="stock-item-info">
                  <span className="stock-item-name">{item.nome}</span>
                  <span className="stock-item-sku">SKU: {item.sku}</span>
                </div>
                <div className="stock-item-qty">
                  <span className="qty-value">{item.quantidade_estoque} un</span>
                  <span className="qty-price">{formatBRL(item.preco_venda)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="widget-footer">
        <button 
          onClick={() => navigate('/dashboard/estoque')}
          style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'transparent', color: 'var(--text-primary)', fontWeight: 600 }}
        >
          Gerenciar Estoque
        </button>
      </div>
    </div>
  );
};

export default CriticalStockWidget;
