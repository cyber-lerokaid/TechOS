import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import PublicOSLink from '@/features/public/PublicOSLink';
import CheckinWizard from '@/features/checkin/CheckinWizard';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ServiceOrdersPage from '@/pages/ServiceOrdersPage';
import CustomersPage from '@/pages/CustomersPage';
import InventoryPage from '@/pages/InventoryPage';
import FinancialPage from '@/pages/FinancialPage';
import SettingsPage from '@/pages/SettingsPage';
import HistoricoPage from '@/pages/HistoricoPage';
import PrintReceipt from '@/pages/PrintReceipt';
import TermosPage from '@/pages/TermosPage';
import PrivacidadePage from '@/pages/PrivacidadePage';
import ContatoPage from '@/pages/ContatoPage';
import { PageTransition } from '@/components/ui/PageTransition';

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
        <Route path="/dashboard/historico" element={<ProtectedRoute><PageTransition><HistoricoPage /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/clientes" element={<ProtectedRoute><PageTransition><CustomersPage /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/estoque" element={<ProtectedRoute><PageTransition><InventoryPage /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/financeiro" element={<ProtectedRoute><PageTransition><FinancialPage /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/configuracoes" element={<ProtectedRoute><PageTransition><SettingsPage /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/ordens/:osId/print" element={<ProtectedRoute><PrintReceipt /></ProtectedRoute>} />
        
        <Route path="/os/:osNumber" element={<PageTransition><PublicOSLink /></PageTransition>} />
        <Route path="/checkin" element={<ProtectedRoute><PageTransition><CheckinWizard /></PageTransition></ProtectedRoute>} />

        {/* Páginas institucionais */}
        <Route path="/termos" element={<PageTransition><TermosPage /></PageTransition>} />
        <Route path="/privacidade" element={<PageTransition><PrivacidadePage /></PageTransition>} />
        <Route path="/contato" element={<PageTransition><ContatoPage /></PageTransition>} />
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
