import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PenSquare, Users, Package, BarChart2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

const BottomNav = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dash', end: true },
    { path: '/dashboard/ordens', icon: PenSquare, label: 'OS' },
    { path: '/dashboard/clientes', icon: Users, label: 'Clientes' },
    { path: '/dashboard/estoque', icon: Package, label: 'Estoque' },
    { path: '/dashboard/financeiro', icon: BarChart2, label: 'Finanças' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
