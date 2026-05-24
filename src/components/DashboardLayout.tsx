import type { ReactNode } from 'react';
import Sidebar from './dashboard/Sidebar';
import Topbar from './dashboard/Topbar';
import BottomNav from './dashboard/BottomNav';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applyDemoScenarios } from '../services/osService';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isDemoMode, signOut } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        {isDemoMode && (
          <div className="demo-banner">
            <span>🎮 Modo demonstração ativo — dados fictícios</span>
            <button onClick={() => {
              applyDemoScenarios();
              window.dispatchEvent(new CustomEvent('showToast', { 
                detail: { message: '5 cenários de demonstração gerados com sucesso!', type: 'success' } 
              }));
            }} className="demo-banner-simulate-btn" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
              🎭 Simular 5 Clientes
            </button>
            <Link to="/register" className="demo-banner-cta">Criar minha conta →</Link>
            <button onClick={signOut} className="demo-banner-close">✕</button>
          </div>
        )}
        <Topbar />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};
