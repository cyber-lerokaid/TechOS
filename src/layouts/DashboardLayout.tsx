import type { ReactNode } from 'react';
import Sidebar from '@/features/dashboard/Sidebar';
import Topbar from '@/features/dashboard/Topbar';
import BottomNav from '@/features/dashboard/BottomNav';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { applyDemoScenarios } from '@/lib/services/osService';
import { CommandPalette } from '@/components/ui/CommandPalette';

import { useState, useEffect } from 'react';
import { WhatsAppSendModal } from '@/components/modals/WhatsAppSendModal';
import { type ServiceOrder } from '@/data/mock-data';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isDemoMode, signOut } = useAuth();
  const queryClient = useQueryClient();
  
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [modalOs, setModalOs] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    const handleStatusChanged = (e: CustomEvent<{ os: ServiceOrder }>) => {
      setModalOs(e.detail.os);
      setIsWhatsAppModalOpen(true);
    };

    window.addEventListener('osStatusChanged', handleStatusChanged as EventListener);
    return () => {
      window.removeEventListener('osStatusChanged', handleStatusChanged as EventListener);
    };
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        {isDemoMode && (
          <div className="demo-banner">
            <span>✨ Modo demonstração ativo — dados fictícios</span>
            <button 
              className="demo-banner-simulate"
              onClick={() => {
                applyDemoScenarios();
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                queryClient.invalidateQueries({ queryKey: ['customers'] });
                queryClient.invalidateQueries({ queryKey: ['inventory'] });
                window.dispatchEvent(new CustomEvent('showToast', { 
                  detail: { message: '5 cenários de demonstração gerados com sucesso!', type: 'success' } 
                }));
              }}
            >
              👥 Simular 5 Clientes
            </button>
            <Link to="/register" className="demo-banner-cta">Criar minha conta 👉</Link>
            <button onClick={signOut} className="demo-banner-close">✕</button>
          </div>
        )}
        <Topbar />
        <main className="dashboard-content">
          <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
      <CommandPalette />
      <WhatsAppSendModal 
        isOpen={isWhatsAppModalOpen} 
        onClose={() => setIsWhatsAppModalOpen(false)} 
        os={modalOs} 
      />
    </div>
  );
};
