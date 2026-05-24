import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, PenSquare, Users, Package, Settings, BarChart2 } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/dashboard/ordens', icon: PenSquare, label: 'Ordens de Serviço' },
    { path: '/dashboard/clientes', icon: Users, label: 'Clientes' },
    { path: '/dashboard/estoque', icon: Package, label: 'Estoque / Vitrine' },
    { path: '/dashboard/financeiro', icon: BarChart2, label: 'Financeiro' },
    { path: '/dashboard/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header flex justify-center items-center py-4">
        <Link to="/" className="block cursor-pointer hover:opacity-80 transition-opacity duration-200">
          <img 
            src="/images/logo-techos.png" 
            alt="TechOS Logo" 
            className="block mx-auto w-48 h-auto object-contain"
          />
        </Link>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
