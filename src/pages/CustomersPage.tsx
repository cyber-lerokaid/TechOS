import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { Users, Plus, Search, Phone, Mail, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_CUSTOMERS, MOCK_SERVICE_ORDERS } from '../data/mock-data';
import { fetchDemoCustomers } from '../services/osService';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { formatTimeAgo } from '../utils';

const CustomersPage = () => {
  const { isDemoMode } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [localCustomers, setLocalCustomers] = useState(isDemoMode ? MOCK_CUSTOMERS : []);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  useEffect(() => {
    const handleDemoGenerated = () => {
      if (isDemoMode) {
        const updated = fetchDemoCustomers();
        setLocalCustomers(updated);
      }
    };
    window.addEventListener('demoDataGenerated', handleDemoGenerated);
    return () => window.removeEventListener('demoDataGenerated', handleDemoGenerated);
  }, [isDemoMode]);

  const filteredCustomers = localCustomers.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.telefone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer = {
      id: `cust_local_${Date.now()}`,
      tenant_id: 'demo-tenant',
      nome: newCustomerName,
      telefone: newCustomerPhone,
      email: newCustomerEmail || null,
      total_gasto: 0,
      total_os: 0,
      criado_em: new Date().toISOString(),
    };
    setLocalCustomers(prev => [newCustomer, ...prev]);
    setNewCustomerName(''); 
    setNewCustomerPhone(''); 
    setNewCustomerEmail('');
    setIsNewCustomerModalOpen(false);
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message: 'Cliente cadastrado com sucesso!', type: 'success' } 
    }));
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Clientes</h1>
          <p className="text-muted" style={{ margin: 0 }}>Gerencie a base de clientes da assistência</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsNewCustomerModalOpen(true)}>
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {localCustomers.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState 
            icon={<Users />}
            title="Nenhum cliente cadastrado"
            description="Você ainda não adicionou nenhum cliente à sua base. Comece cadastrando o primeiro cliente."
            action={
              <button className="btn btn-primary" onClick={() => setIsNewCustomerModalOpen(true)}>
                <Plus size={18} /> Cadastrar Cliente
              </button>
            }
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nome, telefone ou email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 16px 10px 42px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredCustomers.map(customer => (
              <div 
                key={customer.id} 
                onClick={() => setSelectedCustomer(customer)}
                style={{ 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
                className="hover-card"
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <Avatar name={customer.nome} size={48} />
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600 }}>{customer.nome}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Cliente desde {new Date(customer.criado_em).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} /> {customer.telefone}
                  </div>
                  {customer.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} /> {customer.email}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <style>{`.hover-card:hover { border-color: var(--color-primary) !important; transform: translateY(-2px); }`}</style>
        </div>
      )}

      {/* Selected Customer Drawer */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', backgroundColor: 'var(--bg-elevated)', borderLeft: '1px solid var(--border-subtle)', zIndex: 1000, boxShadow: '-4px 0 24px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Detalhes do Cliente</h2>
            <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
          </div>
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><Avatar name={selectedCustomer.nome} size={80} /></div>
              <h3 style={{ margin: '0 0 8px', fontSize: '24px' }}>{selectedCustomer.nome}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{selectedCustomer.email}</p>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{selectedCustomer.telefone}</p>
            </div>
            
            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>Histórico de OS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isDemoMode ? MOCK_SERVICE_ORDERS.filter(os => os.customer_id === selectedCustomer.id).map(os => (
                <div key={os.id} style={{ padding: '16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>OS #{os.numero_os}</span>
                    <Badge variant={os.status === 'pronto' ? 'success' : 'info'}>{os.status.replace('_', ' ').toUpperCase()}</Badge>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '14px' }}>{os.device_label}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{formatTimeAgo(os.atualizado_em)}</p>
                </div>
              )) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Nenhuma OS encontrada.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isNewCustomerModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', width: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Novo Cliente</h2>
              <button onClick={() => setIsNewCustomerModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nome Completo</label>
                <input type="text" required value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Telefone</label>
                <input type="tel" required value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>E-mail</label>
                <input type="email" value={newCustomerEmail} onChange={e => setNewCustomerEmail(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>Salvar Cliente</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomersPage;
