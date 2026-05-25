import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/shared/supabase';
import { useAuth } from '@/app/providers/AuthContext';
import { User, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Toast, type ToastType } from '@/components/ui/Toast';
import './Auth.css';

const RegisterPage = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [toastConfig, setToastConfig] = useState<{ message: string, type: ToastType, visible: boolean }>({ message: '', type: 'info', visible: false });

  // Validação em tempo real do e-mail
  useEffect(() => {
    const checkEmail = async () => {
      if (!email || email.length < 5 || !email.includes('@')) {
        setEmailError(null);
        return;
      }
      
      setIsCheckingEmail(true);
      try {
        const { data, error } = await supabase.rpc('check_email_exists', { lookup_email: email });
        
        if (!error && data === true) {
          setEmailError('Este e-mail já está cadastrado. Faça login.');
        } else {
          setEmailError(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(() => {
      checkEmail();
    }, 800); // 800ms debounce

    return () => clearTimeout(timeoutId);
  }, [email]);

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  
  const strength = calculateStrength(password);

  const { signUp } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) {
      setToastConfig({ message: 'Corrija o erro do e-mail antes de prosseguir.', type: 'error', visible: true });
      return;
    }
    if (strength < 3) {
      setToastConfig({ message: 'Sua senha é muito fraca. Por favor, inclua letras, números e símbolos.', type: 'warning', visible: true });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, nome);
      
      if (!error) {
        setIsEmailSent(true);
        setToastConfig({ message: 'Conta criada! Confirme seu e-mail.', type: 'success', visible: true });
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
        
        {isEmailSent ? (
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 py-8">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Verifique seu e-mail</h2>
            <p className="text-slate-400 mb-8 max-w-sm leading-relaxed">
              Enviamos um link de confirmação para <strong>{email}</strong>. 
              Por favor, verifique sua caixa de entrada e spam para ativar sua conta.
            </p>
            <Link to="/login" className="btn btn-primary w-full justify-center">
              Ir para o Login
            </Link>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <img src="/images/logo-web.png" alt="TechOS Logo" className="w-20 h-20 object-contain mx-auto mb-6 drop-shadow-lg" />
              <h2>Crie sua conta</h2>
              <p>Comece a gerenciar sua assistência hoje mesmo.</p>
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
                style={emailError ? { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' } : {}}
              />
              {isCheckingEmail && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-slate-400" size={16} />
                </div>
              )}
            </div>
            {emailError && (
              <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                <span className="text-sm">⚠️</span> {emailError}
              </p>
            )}
          </div>
          <div className="form-group">
            <label>Senha</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
                disabled={isLoading}
              />
              <button 
                type="button" 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex gap-1 h-1.5">
                  <div className={`flex-1 rounded-full transition-colors ${strength >= 1 ? (strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-white/10'}`}></div>
                  <div className={`flex-1 rounded-full transition-colors ${strength >= 2 ? (strength === 2 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-white/10'}`}></div>
                  <div className={`flex-1 rounded-full transition-colors ${strength >= 3 ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                  <div className={`flex-1 rounded-full transition-colors ${strength >= 4 ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5" style={{ color: strength <= 1 ? '#ef4444' : strength === 2 ? '#fbbf24' : '#10b981' }}>
                    {strength === 0 && <><span className="text-base">😩</span> Muito fraca</>}
                    {strength === 1 && <><span className="text-base">😕</span> Fraca</>}
                    {strength === 2 && <><span className="text-base">😐</span> Razoável</>}
                    {strength === 3 && <><span className="text-base">😃</span> Forte</>}
                    {strength >= 4 && <><span className="text-base">🤩</span> Muito forte</>}
                  </span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 mt-1 font-medium">
                  <li className={`flex items-center gap-1.5 transition-colors ${password.length >= 8 ? 'text-emerald-400' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                    Mínimo 8 caracteres
                  </li>
                  <li className={`flex items-center gap-1.5 transition-colors ${/[A-Z]/.test(password) ? 'text-emerald-400' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                    Letra maiúscula
                  </li>
                  <li className={`flex items-center gap-1.5 transition-colors ${/[0-9]/.test(password) ? 'text-emerald-400' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                    Pelo menos um número
                  </li>
                  <li className={`flex items-center gap-1.5 transition-colors ${/[^A-Za-z0-9]/.test(password) ? 'text-emerald-400' : ''}`}>
                    <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                    Caractere especial (@!#$...)
                  </li>
                </ul>
              </div>
            )}
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
        </>
        )}
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
