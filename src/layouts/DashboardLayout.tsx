import type { ReactNode } from 'react';
import Sidebar from '@/features/dashboard/Sidebar';
import Topbar from '@/features/dashboard/Topbar';
import BottomNav from '@/features/dashboard/BottomNav';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { applyDemoScenarios } from '@/shared/services/osService';
import { CommandPalette } from '@/shared/ui/CommandPalette';
import { useUIStore } from '@/app/store/uiStore';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isDemoMode, signOut } = useAuth();
  const { visualDensity } = useUIStore();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        {isDemoMode && (
          <div className="demo-banner">
            <span>🎮 Modo demonstração ativo — dados fictícios</span>
            <button 
              className="demo-banner-simulate"
              onClick={() => {
                applyDemoScenarios();
                window.dispatchEvent(new CustomEvent('showToast', { 
                  detail: { message: '5 cenários de demonstração gerados com sucesso!', type: 'success' } 
                }));
              }}
            >
              🎭 Simular 5 Clientes
            </button>
            <Link to="/register" className="demo-banner-cta">Criar minha conta →</Link>
            <button onClick={signOut} className="demo-banner-close">✕</button>
          </div>
        )}
        <Topbar />
        <main className="dashboard-content">
          <div style={{ maxWidth: visualDensity === 'compact' ? '1400px' : '1152px', margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
      <CommandPalette />
    </div>
  );
};
