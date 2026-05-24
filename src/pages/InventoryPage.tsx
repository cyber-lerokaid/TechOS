import { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, Plus, AlertTriangle, Package, TrendingUp, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_PRODUCTS, formatBRL } from '../data/mock-data';
import { Badge } from '../components/ui/Badge';
import './InventoryPage.css';

const InventoryPage = () => {
  const { isDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'estoque' | 'vitrine'>('estoque');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  const [localProducts] = useState(isDemoMode ? MOCK_PRODUCTS : []);

  const categories = ['todos', 'notebook', 'celular', 'desktop', 'acessorio', 'outro'];

  const filteredProducts = localProducts.filter(p => {
    const matchSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'todos' || p.categoria === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setIsNewProductModalOpen(false);
  };

  const getMargin = (custo: number, venda: number) => {
    if (venda === 0) return 0;
    return (((venda - custo) / venda) * 100).toFixed(1);
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Estoque & Vitrine</h1>
          <p className="text-muted" style={{ margin: 0 }}>Gerencie peças e produtos à venda</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsNewProductModalOpen(true)}>
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
        <button 
          className={`tab-btn ${activeTab === 'estoque' ? 'active' : ''}`}
          onClick={() => setActiveTab('estoque')}
        >
          Controle de Estoque
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vitrine' ? 'active' : ''}`}
          onClick={() => setActiveTab('vitrine')}
        >
          Visão da Vitrine
        </button>
      </div>

      {localProducts.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState 
            icon={<Package />}
            title="Estoque vazio"
            description="Você ainda não possui peças ou produtos cadastrados no sistema."
            action={
              <button className="btn btn-primary" onClick={() => setIsNewProductModalOpen(true)}>
                <Plus size={18} /> Adicionar Produto
              </button>
            }
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou SKU..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 16px 10px 42px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', paddingBottom: '4px' }}>
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setCategoryFilter(cat)}
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    backgroundColor: categoryFilter === cat ? 'var(--color-primary)' : 'var(--bg-elevated)',
                    color: categoryFilter === cat ? '#fff' : 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '13px',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'estoque' && (
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px' }}>Produto / Peça</th>
                    <th style={{ padding: '16px' }}>SKU</th>
                    <th style={{ padding: '16px' }}>Qtd</th>
                    <th style={{ padding: '16px' }}>Custo</th>
                    <th style={{ padding: '16px' }}>Venda</th>
                    <th style={{ padding: '16px' }}>Margem</th>
                    <th style={{ padding: '16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const margin = getMargin(p.preco_custo, p.preco_venda);
                    const isLow = p.quantidade_estoque <= 3 || p.estoque_critico;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover-row">
                        <td style={{ padding: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} />
                          </div>
                          {p.nome}
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>{p.sku}</td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isLow ? 'var(--color-danger)' : 'inherit', fontWeight: isLow ? 600 : 400 }}>
                            {p.quantidade_estoque}
                            {isLow && <AlertTriangle size={14} />}
                          </div>
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{formatBRL(p.preco_custo)}</td>
                        <td style={{ padding: '16px', fontWeight: 600 }}>{formatBRL(p.preco_venda)}</td>
                        <td style={{ padding: '16px' }}>
                          <Badge variant="success"><TrendingUp size={12} style={{ marginRight: 4 }} /> {margin}%</Badge>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {p.ativo ? <Badge variant="success">Ativo</Badge> : <Badge variant="info">Inativo</Badge>}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum produto encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'vitrine' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {filteredProducts.map(p => (
                <div key={p.id} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '140px', backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {p.desconto_vitrine && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'var(--color-warning)', color: '#000', fontSize: '12px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px' }}>
                        -{p.desconto_vitrine}%
                      </div>
                    )}
                    <Package size={48} style={{ color: 'var(--border-default)' }} />
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600, flex: 1 }}>{p.nome}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                      <div>
                        {p.desconto_vitrine && (
                          <div style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                            {formatBRL(p.preco_venda)}
                          </div>
                        )}
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {formatBRL(p.preco_venda * (1 - (p.desconto_vitrine || 0) / 100))}
                        </div>
                      </div>
                      <Badge variant={p.quantidade_estoque > 0 ? "success" : "danger"}>
                        {p.quantidade_estoque > 0 ? 'Em estoque' : 'Esgotado'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Product Modal */}
      {isNewProductModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', width: '450px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Novo Produto / Peça</h2>
              <button onClick={() => setIsNewProductModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nome do Produto</label>
                <input type="text" required style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>SKU / Código</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Qtd Estoque</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Preço Custo</label>
                  <input type="number" step="0.01" required style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Preço Venda</label>
                  <input type="number" step="0.01" required style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>Salvar Produto</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InventoryPage;
