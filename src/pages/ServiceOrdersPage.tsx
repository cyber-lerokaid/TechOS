import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { STATUS_CONFIG, formatBRL } from '../data/mock-data';
import { Search, Plus, Filter } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { formatTimeAgo } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { OsDrawer } from '../components/dashboard/OsDrawer';
import { fetchOrdensServico } from '../services/osService';
import { useNavigate } from 'react-router-dom';

const ServiceOrdersPage = () => {
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOsId, setSelectedOsId] = useState<string | null>(null);
  const [baseOrders, setBaseOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const data = await fetchOrdensServico(isDemoMode);
        setBaseOrders(data || []);
      } catch (error) {
        console.error("Erro ao buscar ordens de serviço:", error);
        setBaseOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
    window.addEventListener('osUpdated', loadOrders);
    window.addEventListener('demoDataGenerated', loadOrders);
    return () => {
      window.removeEventListener('osUpdated', loadOrders);
      window.removeEventListener('demoDataGenerated', loadOrders);
    };
  }, [isDemoMode]);

  const filteredOrders = baseOrders.filter(os => 
    os.numero_os.includes(searchTerm) || 
    os.customer_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.device_label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Ordens de Serviço</h1>
          <p className="text-muted" style={{ margin: 0 }}>Gerencie todas as OS da sua assistência</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/checkin')}>
          <Plus size={18} /> Nova OS
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por OS, cliente ou aparelho..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 16px 10px 42px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
            />
          </div>
          <button className="btn btn-outline">
            <Filter size={18} /> Filtros
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px' }}>OS</th>
                <th style={{ padding: '16px' }}>Cliente</th>
                <th style={{ padding: '16px' }}>Aparelho</th>
                <th style={{ padding: '16px' }}>Valor</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Técnico</th>
                <th style={{ padding: '16px' }}>Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando ordens de serviço...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma OS encontrada.</td>
                </tr>
              ) : (
                filteredOrders.map(os => (
                  <tr 
                    key={os.id} 
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.2s' }} 
                    className="hover-row"
                    onClick={() => {
                      setSelectedOsId(os.id);
                    }}
                  >
                    <td style={{ padding: '16px', fontWeight: 600, color: 'var(--color-primary)' }}>#{os.numero_os}</td>
                    <td style={{ padding: '16px' }}>{os.customer_nome}</td>
                    <td style={{ padding: '16px' }}>{os.device_label}</td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>
                      {os.valor_mao_obra || os.valor_pecas ? formatBRL((os.valor_mao_obra || 0) + (os.valor_pecas || 0)) : '-'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: `${STATUS_CONFIG[os.status as keyof typeof STATUS_CONFIG]?.cor || 'var(--color-primary)'}20`,
                        color: STATUS_CONFIG[os.status as keyof typeof STATUS_CONFIG]?.cor || 'var(--color-primary)',
                      }}>
                        {STATUS_CONFIG[os.status as keyof typeof STATUS_CONFIG]?.label || os.status}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar name={os.technician_nome} size={24} />
                        <span style={{ fontSize: '13px' }}>{os.technician_nome.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>{formatTimeAgo(os.atualizado_em)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <style>{`
            .hover-row:hover { background-color: var(--bg-elevated); cursor: pointer; }
          `}</style>
        </div>
      </div>

      <OsDrawer 
        osId={selectedOsId} 
        onClose={() => setSelectedOsId(null)} 
      />
    </DashboardLayout>
  );
};

export default ServiceOrdersPage;
