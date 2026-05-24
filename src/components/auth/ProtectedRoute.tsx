import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Settings } from 'lucide-react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isDemoMode } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
        <Settings size={48} color="var(--color-primary)" className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
        <style>
          {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  if (!user && !isDemoMode) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
