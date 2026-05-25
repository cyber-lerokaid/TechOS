import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Save, Store, User, Shield, Bell, Loader2 } from 'lucide-react';
import { Toast, type ToastType } from '@/components/ui/Toast';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import { supabase } from '@/lib/shared/supabase';
import { useAuth } from '@/app/providers/AuthContext';

const SettingsPage = () => {
  const { user, tenant } = useAuth();
  
  const userName = user?.user_metadata?.nome || user?.nome || '';
  const userEmail = user?.email || '';
  const tenantName = tenant?.nome_loja || tenant?.nome || '';
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [toastConfig, setToastConfig] = useState<{ message: string, type: ToastType, visible: boolean }>({ message: '', type: 'info', visible: false });

  // Form states
  const [formData, setFormData] = useState({
    nome: userName,
    email: userEmail,
    telefone: user?.user_metadata?.telefone || tenant?.telefone || ''
  });

  useEffect(() => {
    setFormData({
      nome: userName,
      email: userEmail,
      telefone: user?.user_metadata?.telefone || tenant?.telefone || ''
    });
  }, [userName, userEmail, tenant]);

  const formatPhone = (val: string) => {
    let num = val.replace(/\D/g, '');
    if (num.length > 11) num = num.slice(0, 11);
    if (num.length === 0) return '';
    if (num.length <= 2) return `(${num}`;
    if (num.length <= 6) return `(${num.slice(0, 2)}) ${num.slice(2)}`;
    if (num.length <= 10) return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`;
    return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, telefone: formatPhone(e.target.value) });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          nome: formData.nome,
          telefone: formData.telefone
        }
      });
      if (error) throw error;
      setToastConfig({ message: 'Informações pessoais salvas!', type: 'success', visible: true });
    } catch (err: any) {
      setToastConfig({ message: err.message || 'Erro ao salvar', type: 'error', visible: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setToastConfig({ message: 'Configurações da loja salvas!', type: 'success', visible: true });
    }, 500);
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Meu Perfil' },
    { id: 'store', icon: Store, label: 'Assistência' },
    { id: 'security', icon: Shield, label: 'Segurança' },
    { id: 'notifications', icon: Bell, label: 'Notificações' }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as preferências da sua conta e da assistência técnica</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-sm",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent bg-surface-2/80 backdrop-blur-md"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <Card className="border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden min-h-[500px]">
            <CardContent className="p-6 md:p-8">
              
              {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="border-b border-white/5 pb-4 mb-6">
                    <h3 className="text-xl font-bold tracking-tight">Informações Pessoais</h3>
                    <p className="text-sm text-muted-foreground">Atualize sua foto e dados pessoais.</p>
                  </div>
                  <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 max-w-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Nome Completo</label>
                      <Input 
                        type="text" 
                        value={formData.nome} 
                        onChange={(e) => setFormData({...formData, nome: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">E-mail</label>
                      <Input 
                        type="email" 
                        value={formData.email} 
                        disabled 
                        className="opacity-60 cursor-not-allowed" 
                        title="O e-mail de login não pode ser alterado por aqui" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Telefone</label>
                      <Input 
                        type="tel" 
                        value={formData.telefone} 
                        onChange={handlePhoneChange} 
                        placeholder="(11) 90000-0000"
                      />
                    </div>
                    
                    <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'store' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="border-b border-white/5 pb-4 mb-6">
                    <h3 className="text-xl font-bold tracking-tight">Dados da Assistência</h3>
                    <p className="text-sm text-muted-foreground">As informações da sua loja física.</p>
                  </div>
                  <form onSubmit={handleSaveStore} className="flex flex-col gap-5 max-w-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Nome da Loja</label>
                      <Input type="text" defaultValue={tenantName} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Endereço</label>
                      <Input type="text" defaultValue={tenant?.endereco || ""} />
                    </div>
                    
                    <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="border-b border-white/5 pb-4 mb-6">
                    <h3 className="text-xl font-bold tracking-tight">Segurança</h3>
                    <p className="text-sm text-muted-foreground">Altere a sua senha e aumente a segurança.</p>
                  </div>
                  <form onSubmit={handleSaveStore} className="flex flex-col gap-5 max-w-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Senha Atual</label>
                      <Input type="password" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Nova Senha</label>
                      <Input type="password" required />
                    </div>
                    
                    <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                        {isLoading ? 'Salvando...' : 'Atualizar Senha'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="border-b border-white/5 pb-4 mb-6">
                    <h3 className="text-xl font-bold tracking-tight">Notificações</h3>
                    <p className="text-sm text-muted-foreground">Escolha o que deseja receber no seu e-mail e app.</p>
                  </div>
                  <form onSubmit={handleSaveStore} className="flex flex-col gap-5 max-w-xl">
                    <div className="flex flex-col gap-4">
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                        <input type="checkbox" className="w-4 h-4 text-primary rounded focus:ring-primary" defaultChecked />
                        <span className="text-sm font-medium">Receber alertas de estoque baixo</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                        <input type="checkbox" className="w-4 h-4 text-primary rounded focus:ring-primary" defaultChecked />
                        <span className="text-sm font-medium">Notificar quando OS for aprovada pelo cliente</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                        <input type="checkbox" className="w-4 h-4 text-primary rounded focus:ring-primary" defaultChecked />
                        <span className="text-sm font-medium">Resumo diário financeiro por e-mail</span>
                      </label>
                    </div>
                    
                    <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isLoading ? 'Salvando...' : 'Salvar Preferências'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}



            </CardContent>
          </Card>
        </main>
      </div>
      
      <Toast 
        visible={toastConfig.visible} 
        message={toastConfig.message} 
        type={toastConfig.type} 
        onClose={() => setToastConfig({ ...toastConfig, visible: false })} 
      />
    </DashboardLayout>
  );
};

export default SettingsPage;
