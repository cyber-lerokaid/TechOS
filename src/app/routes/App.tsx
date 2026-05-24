import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import Dashboard from '@/features/dashboard/Dashboard';
import PublicOSLink from '@/features/public/PublicOSLink';
import CheckinWizard from '@/features/checkin/CheckinWizard';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import ServiceOrdersPage from '@/features/orders/ServiceOrdersPage';
import CustomersPage from '@/features/customers/CustomersPage';
import InventoryPage from '@/features/inventory/InventoryPage';
import FinancialPage from '@/features/financial/FinancialPage';
import SettingsPage from '@/features/settings/SettingsPage';
import WhatsAppPage from '@/features/whatsapp/WhatsAppPage';
import { PageTransition } from '@/shared/ui/PageTransition';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/ordens" element={<ProtectedRoute><PageTransition><ServiceOrdersPage /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/clientes" element={<ProtectedRoute><PageTransition><CustomersPage /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/estoque" element={<ProtectedRoute><PageTransition><InventoryPage /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/financeiro" element={<ProtectedRoute><PageTransition><FinancialPage /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/whatsapp" element={<ProtectedRoute><PageTransition><WhatsAppPage /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/configuracoes" element={<ProtectedRoute><PageTransition><SettingsPage /></PageTransition></ProtectedRoute>} />
        
        <Route path="/os/:osNumber" element={<PageTransition><PublicOSLink /></PageTransition>} />
        <Route path="/checkin" element={<ProtectedRoute><PageTransition><CheckinWizard /></PageTransition></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
