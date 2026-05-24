import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { BarChart2, Download, DollarSign, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatBRL, type ServiceOrder } from '../data/mock-data';
import { Toast, type ToastType } from '../components/ui/Toast';
import { Badge } from '../components/ui/Badge';
import { calcularFinanceiro, getTransacoesPorPeriodo } from '../utils/financialCalc';
import { fetchOrdensServico } from '../services/osService';

const FinancialPage = () => {
  const { isDemoMode } = useAuth();
  const [period, setPeriod] = useState('7d');
  const [toastConfig, setToastConfig] = useState<{ message: string, type: ToastType, visible: boolean }>({ message: '', type: 'info', visible: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchOrdensServico(isDemoMode);
      setOrders(data || []);
    };
    loadOrders();
    window.addEventListener('osUpdated', loadOrders);
    window.addEventListener('demoDataGenerated', loadOrders);
    return () => {
      window.removeEventListener('osUpdated', loadOrders);
      window.removeEventListener('demoDataGenerated', loadOrders);
    };
  }, [isDemoMode]);

  const summary = calcularFinanceiro(orders, period);
  const transacoes = getTransacoesPorPeriodo(orders, period);

  const filteredOrders = transacoes.filter(os => 
    os.numero_os.includes(searchTerm) || 
    os.customer_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    setToastConfig({ message: 'Exportação estará disponível em breve!', type: 'info', visible: true });
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Financeiro</h1>
          <p className="text-muted" style={{ margin: 0 }}>Controle de caixa, receitas e despesas</p>
        </div>
        <button className="btn btn-outline" onClick={handleExport}>
          <Download size={18} /> Exportar Relatório
        </button>
      </div>

      {transacoes.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState 
            icon={<BarChart2 />}
            title="Nenhuma transação encontrada"
            description="Nenhuma OS concluída nesse período."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Period Selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Hoje', '7d', '15d', '30d', 'Este Mês'].map(p => (
              <button 
                key={p} 
                onClick={() => setPeriod(p)}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  backgroundColor: period === p ? 'var(--color-primary)' : 'var(--bg-elevated)',
                  color: period === p ? '#fff' : 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: summary.variacao_percentual >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: summary.variacao_percentual >= 0 ? '#10B981' : '#EF4444' }}>
                  {summary.variacao_percentual >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                </div>
                <Badge variant={summary.variacao_percentual >= 0 ? 'success' : 'danger'}>
                  {summary.variacao_percentual > 0 ? '+' : ''}{summary.variacao_percentual}%
                </Badge>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 8px' }}>Receitas Totais</p>
              <h2 style={{ fontSize: '28px', margin: 0 }}>{formatBRL(summary.receita_total)}</h2>
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}><ArrowDownRight size={24} /></div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 8px' }}>Custo Est. Peças</p>
              <h2 style={{ fontSize: '28px', margin: 0 }}>{formatBRL(summary.custo_pecas)}</h2>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(14, 165, 233, 0.1)', color: 'var(--color-primary)' }}><DollarSign size={24} /></div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 8px' }}>Ticket Médio</p>
              <h2 style={{ fontSize: '28px', margin: 0 }}>{formatBRL(summary.ticket_medio)}</h2>
            </div>
          </div>

          {/* Transactions List */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Histórico de Transações</h3>
              <div style={{ position: 'relative', width: '250px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px' }}
                />
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px 24px' }}>Data</th>
                  <th style={{ padding: '16px 24px' }}>Descrição</th>
                  <th style={{ padding: '16px 24px' }}>Categoria</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((os, i) => {
                  const valorTotal = (os.valor_mao_obra || 0) + (os.valor_pecas || 0);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                        {new Date(os.atualizado_em).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                        Fechamento OS #{os.numero_os} - {os.customer_nome}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Badge variant="success">Serviço</Badge>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: '#10B981' }}>
                        + {formatBRL(valorTotal)}
                      </td>
                    </tr>
                  )
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma transação no período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <Toast 
        visible={toastConfig.visible} 
        message={toastConfig.message} 
        type={toastConfig.type} 
        onClose={() => setToastConfig({ ...toastConfig, visible: false })} 
      />
    </DashboardLayout>
  );
};

export default FinancialPage;
