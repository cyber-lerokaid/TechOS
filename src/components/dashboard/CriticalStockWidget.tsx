import { getCriticalStock, formatBRL } from '../../data/mock-data';
import { AlertTriangle, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CriticalStockWidget.css';

const CriticalStockWidget = () => {
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const criticalItems = isDemoMode ? getCriticalStock() : [];

  return (
    <div className="widget critical-stock-widget">
      <div className="widget-header">
        <div className="widget-title-group">
          <AlertTriangle size={18} className="text-warning" />
          <h3>Estoque Crítico</h3>
        </div>
        <span className="badge badge-warning">{criticalItems.length} itens</span>
      </div>
      
      <div className="widget-content">
        {criticalItems.length === 0 ? (
          <div className="empty-state">
            <Package size={32} className="text-muted-light" />
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
                  <span className="qty-value text-danger">{item.quantidade_estoque} un</span>
                  <span className="qty-price">{formatBRL(item.preco_venda)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="widget-footer">
        <button className="btn btn-outline btn-full" onClick={() => navigate('/dashboard/estoque')}>
          Gerenciar Estoque
        </button>
      </div>
    </div>
  );
};

export default CriticalStockWidget;
