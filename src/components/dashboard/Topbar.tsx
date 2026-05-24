import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { fetchOrdensServico, fetchDemoCustomers } from '../../services/osService';
import { getCriticalStock } from '../../data/mock-data';
import './Topbar.css';

const Topbar = () => {
  const { user, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [criticalStock, setCriticalStock] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const osData = await fetchOrdensServico(isDemoMode);
      setOrders(osData || []);
      
      if (isDemoMode) {
        setCustomers(fetchDemoCustomers());
        setCriticalStock(getCriticalStock());
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

  const filteredOrders = orders.filter(os => 
    os.numero_os?.includes(searchTerm) || os.device_label?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 3);
  
  const filteredCustomers = customers.filter(c => 
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || c.telefone?.includes(searchTerm)
  ).slice(0, 3);

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
      <div className="topbar-left">
        <div className="topbar-search" ref={searchRef}>
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar OS, cliente ou aparelho..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          
          {isSearchOpen && searchTerm.length > 1 && (
            <div className="search-dropdown">
              <div className="search-section">
                <h4>Ordens de Serviço</h4>
                {filteredOrders.length === 0 ? <div className="search-empty">Nenhuma OS encontrada</div> : null}
                {filteredOrders.map(os => (
                  <div key={os.id} className="search-result-item" onClick={() => handleSearchClick('/dashboard/os')}>
                    <div>
                      <span className="font-semibold">#{os.numero_os}</span> - {os.device_label}
                    </div>
                    <Badge variant="info">{os.status?.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
              
              <div className="search-section">
                <h4>Clientes</h4>
                {filteredCustomers.length === 0 ? <div className="search-empty">Nenhum cliente encontrado</div> : null}
                {filteredCustomers.map(c => (
                  <div key={c.id} className="search-result-item" onClick={() => handleSearchClick('/dashboard/clientes')}>
                    <div>
                      <span className="font-semibold">{c.nome}</span>
                      <div className="text-muted text-sm">{c.telefone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="topbar-actions">
        <button className="btn btn-primary btn-new-os" onClick={() => navigate('/checkin')}>
          <Plus size={18} />
          <span>Nova OS</span>
        </button>

        <div className="relative" ref={notifRef}>
          <button className="notification-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
            <Bell size={20} />
            {isDemoMode && <span className="notification-badge"></span>}
          </button>
          
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl shadow-lg z-50 py-2">
              <div className="px-4 py-2 border-b border-[var(--border-subtle)] font-semibold text-[var(--text-primary)]">
                Notificações
              </div>
              <div className="flex flex-col">
                {orders.filter(os => os.status === 'pronto').map(os => (
                  <div key={os.id} className="px-4 py-3 hover:bg-[var(--bg-card-hover)] cursor-pointer border-b border-[var(--border-subtle)]" onClick={() => navigate('/dashboard/os')}>
                    <p className="text-sm text-[var(--text-primary)]">OS #{os.numero_os} está pronta para retirada</p>
                    <span className="text-xs text-[var(--text-muted)]">{os.customer_nome}</span>
                  </div>
                ))}
                {criticalStock.map(item => (
                  <div key={item.id} className="px-4 py-3 hover:bg-[var(--bg-card-hover)] cursor-pointer border-b border-[var(--border-subtle)]" onClick={() => navigate('/dashboard/estoque')}>
                    <p className="text-sm text-[var(--text-primary)]">Estoque crítico: {item.nome} ({item.quantidade} un)</p>
                  </div>
                ))}
                {orders.filter(os => os.status !== 'pronto').length === 0 && criticalStock.length === 0 && (
                  <div className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
                    Nenhuma notificação no momento
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user?.user_metadata?.name || 'Técnico Logado'}</span>
            <span className="user-role">Administrador</span>
          </div>
          <Avatar name={user?.user_metadata?.name || 'Técnico Logado'} url={user?.user_metadata?.avatar_url} />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
