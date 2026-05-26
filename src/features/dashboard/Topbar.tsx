import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, Menu, LogOut, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { orderApi } from '@/shared/lib/api/order.api';
import { customerApi } from '@/shared/lib/api/customer.api';
import { getCriticalStock } from '@/data/mock-data';
import { ScannerModal } from '@/components/modals/ScannerModal';
import './Topbar.css';

const Topbar = () => {
  const { user, isDemoMode, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [criticalStock, setCriticalStock] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const osData = await orderApi.getOrders();
        setOrders(osData || []);
        
        const custData = await customerApi.getCustomers();
        setCustomers(custData || []);
        
        if (isDemoMode) {
          setCriticalStock(getCriticalStock());
        }
      } catch (err) {
        console.error("Erro ao carregar dados do Topbar", err);
      }
    };
    loadData();
    window.addEventListener('osUpdated', loadData);
    window.addEventListener('demoDataGenerated', loadData);
    return () => {
      window.removeEventListener('osUpdated', loadData);
      window.removeEventListener('demoDataGenerated', loadData);
    };
  }, [isDemoMode]);

  const safeLower = (str: any) => (str || '').toString().toLowerCase();

  const filteredOrders = orders.filter(os => {
    const search = safeLower(searchTerm);
    return safeLower(os.numeroOs).includes(search) || 
           safeLower(os.deviceLabel).includes(search) ||
           safeLower(os.customerNome).includes(search);
  }).slice(0, 5);
  
  const filteredCustomers = customers.filter(c => {
    const search = safeLower(searchTerm);
    return safeLower(c.nome).includes(search) || 
           safeLower(c.telefone).includes(search) ||
           safeLower(c.email).includes(search);
  }).slice(0, 5);

  const handleSearchClick = (path: string) => {
    setIsSearchOpen(false);
    setSearchTerm('');
    navigate(path);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <Button variant="ghost" size="icon" className="mobile-menu-btn" style={{ display: 'none' }}>
          <Menu size={24} />
        </Button>
        
        <div className="topbar-search" ref={searchRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar OS, cliente ou aparelho... (Ctrl+K)" 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            style={{ paddingRight: '48px' }}
          />
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="absolute right-2 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            title="Escanear Código"
          >
            <ScanLine size={18} />
          </button>
          
          {isSearchOpen && searchTerm.length > 1 && (
            <div className="search-dropdown">
              <div style={{ padding: '12px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Ordens de Serviço</h4>
                {filteredOrders.length === 0 ? <div style={{ fontSize: '14px', color: 'var(--text-muted)', padding: '8px 0', textAlign: 'center' }}>Nenhuma OS encontrada</div> : null}
                {filteredOrders.map(os => (
                  <div key={os.id} className="search-result-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', cursor: 'pointer', borderRadius: 'var(--radius-md)' }} onClick={() => handleSearchClick(`/dashboard/ordens?search=${encodeURIComponent(os.numeroOs)}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{os.numeroOs}</span> 
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{os.deviceLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Clientes</h4>
                {filteredCustomers.length === 0 ? <div style={{ fontSize: '14px', color: 'var(--text-muted)', padding: '8px 0', textAlign: 'center' }}>Nenhum cliente encontrado</div> : null}
                {filteredCustomers.map(c => (
                  <div key={c.id} className="search-result-item" style={{ padding: '8px', cursor: 'pointer', borderRadius: 'var(--radius-md)' }} onClick={() => handleSearchClick(`/dashboard/clientes?search=${encodeURIComponent(c.nome)}`)}>
                    <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>{c.nome}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.telefone}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Button variant="premium" onClick={() => navigate('/checkin')}>
          <Plus size={16} style={{ marginRight: '8px' }} />
          Nova OS
        </Button>

        <div style={{ position: 'relative' }} ref={notifRef}>
          <Button variant="ghost" size="icon" className="notification-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
            <Bell size={20} />
            {isDemoMode && <span className="notification-badge"></span>}
          </Button>
          
          {isNotifOpen && (
            <div style={{ position: 'absolute', right: 0, marginTop: '8px', width: '320px', backgroundColor: 'var(--surface-floating)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 50 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, color: 'var(--text-primary)' }}>
                Notificações
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {orders.filter(os => os.status === 'pronto').map(os => (
                  <div key={os.id} className="search-result-item" style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }} onClick={() => navigate('/dashboard/os')}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>OS #{os.numeroOs} está pronta para retirada</p>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{os.customerNome}</span>
                  </div>
                ))}
                {criticalStock.map(item => (
                  <div key={item.id} className="search-result-item" style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }} onClick={() => navigate('/dashboard/estoque')}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Estoque crítico: {item.nome} ({item.quantidade} un)</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span className="user-name">{user?.user_metadata?.nome || user?.nome || 'Técnico Logado'}</span>
              <span className="user-role">Administrador</span>
            </div>
            <Avatar name={user?.user_metadata?.nome || user?.nome || 'Técnico Logado'} url={user?.user_metadata?.avatar_url} />
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sair do sistema">
            <LogOut size={20} style={{ color: 'var(--text-muted)' }} />
          </Button>
        </div>
      </div>
      
      <ScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScan={(text) => {
          setSearchTerm(text);
          setIsSearchOpen(true);
          // Opcional: já redirecionar caso encontre uma OS exata
          const found = orders.find(o => o.numeroOs === text);
          if (found) {
            navigate(`/dashboard/ordens?search=${encodeURIComponent(text)}`);
          }
        }}
      />
    </header>
  );
};

export default Topbar;
