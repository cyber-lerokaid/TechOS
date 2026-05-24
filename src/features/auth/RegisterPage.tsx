import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Toast, type ToastType } from '@/shared/ui/Toast';
import './Auth.css';

const RegisterPage = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastConfig, setToastConfig] = useState<{ message: string, type: ToastType, visible: boolean }>({ message: '', type: 'info', visible: false });

  const { signUp, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setToastConfig({ message: 'A senha deve ter pelo menos 6 caracteres.', type: 'warning', visible: true });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, nome);
      
      if (!error) {
        setToastConfig({ message: 'Conta criada com sucesso! Redirecionando...', type: 'success', visible: true });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        // Tratamento de mensagens comuns de erro do Supabase
        let errorMessage = 'Ocorreu um erro ao registrar.';
        if (error.message.includes('already registered')) {
          errorMessage = 'Este e-mail já está cadastrado.';
        } else if (error.message.includes('weak password')) {
          errorMessage = 'Senha muito fraca. Use uma senha mais segura.';
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
          <h2>Crie sua conta</h2>
          <p>Comece a gerenciar sua assistência hoje mesmo.</p>
          {isDemoMode && (
            <div className="demo-alert">
              Modo Demo Ativo. Acesse sem registro para testar a interface, ou crie uma conta real.
            </div>
          )}
        </div>
        
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>Nome Completo</label>
            <div className="input-with-icon">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                placeholder="Seu nome" 
                value={nome}
                onChange={e => setNome(e.target.value)}
                required 
                disabled={isLoading}
              />
            </div>
          </div>
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
                placeholder="Mínimo 6 caracteres" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
                min={6}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <span>Criar Conta</span>
                <ArrowRight size={20} />
              </>
            )}
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </button>
        </form>
        
        <div className="auth-footer">
          Já tem uma conta? <Link to="/login">Faça login</Link>
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

export default RegisterPage;
