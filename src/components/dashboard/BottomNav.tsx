import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PenSquare, Users, Package, BarChart2 } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dash', end: true },
    { path: '/dashboard/ordens', icon: PenSquare, label: 'OS' },
    { path: '/dashboard/clientes', icon: Users, label: 'Clientes' },
    { path: '/dashboard/estoque', icon: Package, label: 'Estoque' },
    { path: '/dashboard/financeiro', icon: BarChart2, label: 'Finanças' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon className="bottom-nav-icon" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
