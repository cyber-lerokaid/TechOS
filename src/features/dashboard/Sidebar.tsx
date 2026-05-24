import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, PenSquare, Users, Package, Settings, BarChart2, MessageSquare } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/dashboard/ordens', icon: PenSquare, label: 'Ordens de Serviço' },
    { path: '/dashboard/clientes', icon: Users, label: 'Clientes' },
    { path: '/dashboard/estoque', icon: Package, label: 'Estoque' },
    { path: '/dashboard/financeiro', icon: BarChart2, label: 'Financeiro' },
    { path: '/dashboard/whatsapp', icon: MessageSquare, label: 'WhatsApp', highlight: true },
    { path: '/dashboard/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', textDecoration: 'none' }}>
          <div className="sidebar-logo">
            <img src="/images/logo-techos.png" alt="TechOS Logo" />
          </div>
          <div className="sidebar-title">
            TechOS
          </div>
          <div className="sidebar-subtitle">
            Operational System
          </div>
        </Link>
      </div>
      
      <div className="sidebar-nav">
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              <span style={{ flex: 1, zIndex: 10, position: 'relative' }}>{item.label}</span>
              {item.highlight && (
                <span className="nav-dot"></span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="sidebar-footer">
      </div>
    </aside>
  );
};

export default Sidebar;
