import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import PublicOSLink from './pages/PublicOSLink';
import CheckinWizard from './pages/CheckinWizard';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServiceOrdersPage from './pages/ServiceOrdersPage';
import CustomersPage from './pages/CustomersPage';
import InventoryPage from './pages/InventoryPage';
import FinancialPage from './pages/FinancialPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/ordens" element={<ProtectedRoute><ServiceOrdersPage /></ProtectedRoute>} />
        <Route path="/dashboard/clientes" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
        <Route path="/dashboard/estoque" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
        <Route path="/dashboard/financeiro" element={<ProtectedRoute><FinancialPage /></ProtectedRoute>} />
        <Route path="/dashboard/configuracoes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        
        <Route path="/os/:osNumber" element={<PublicOSLink />} />
        <Route path="/checkin" element={<ProtectedRoute><CheckinWizard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
