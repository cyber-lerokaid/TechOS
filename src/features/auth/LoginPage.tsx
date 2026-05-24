import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';
import { Toast, type ToastType } from '@/shared/ui/Toast';
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastConfig, setToastConfig] = useState<{ message: string, type: ToastType, visible: boolean }>({ message: '', type: 'info', visible: false });

  const { signIn, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (!error) {
        setToastConfig({ message: 'Login realizado com sucesso! Redirecionando...', type: 'success', visible: true });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        let errorMessage = 'Erro ao fazer login.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'E-mail ou senha incorretos.';
        } else {
          errorMessage = error.message;
        }
        setToastConfig({ message: errorMessage, type: 'error', visible: true });
      }
    } catch (err: any) {
      setToastConfig({ message: 'Erro inesperado: ' + err.message, type: 'error', visible: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <img src="/images/logo-web.png" alt="TechOS Logo" className="w-20 h-20 object-contain mx-auto mb-6 drop-shadow-lg" />
          <h2>Bem-vindo de volta</h2>
          <p>Faça login para gerenciar sua assistência.</p>
          {isDemoMode && (
            <div className="demo-alert">
              Modo Demo Ativo. Configure VITE_SUPABASE_URL e KEY no .env para fluxo real.
            </div>
          )}
        </div>
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Senha</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
                disabled={isLoading}
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <span>Entrar</span>
                <ArrowRight size={20} />
              </>
            )}
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </button>
        </form>
        
        <div className="auth-footer">
          Não possui uma conta? <Link to="/register">Crie agora</Link>
        </div>
      </div>
      
      <Toast 
        visible={toastConfig.visible} 
        message={toastConfig.message} 
        type={toastConfig.type} 
        onClose={() => setToastConfig({ ...toastConfig, visible: false })} 
      />
    </div>
  );
};

export default LoginPage;
