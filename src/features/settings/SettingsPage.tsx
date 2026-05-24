import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Save, Store, User, Shield, Bell, Loader2, MessageCircle } from 'lucide-react';
import { Toast, type ToastType } from '@/shared/ui/Toast';
import { Card, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/shared/utils/cn';
import { ToggleSwitch } from '@/shared/ui/ToggleSwitch';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [toastConfig, setToastConfig] = useState<{ message: string, type: ToastType, visible: boolean }>({ message: '', type: 'info', visible: false });

  // WhatsApp states
  const [notifications, setNotifications] = useState({
    checkin: true,
    status: true,
    orcamento: true,
    pronto: true,
    reativacao: false
  });
  const [whatsappLogs] = useState<{id: string, date: string, type: string, phone: string, status: string}[]>([
    { id: '1', date: 'Há 5 min', type: 'checkin', phone: '5592999999999', status: 'sent' },
    { id: '2', date: 'Há 2 hrs', type: 'orcamento', phone: '5592988888888', status: 'sent' },
    { id: '3', date: 'Há 1 dia', type: 'status_update', phone: '5592977777777', status: 'failed' },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setToastConfig({ message: 'Configurações salvas com sucesso!', type: 'success', visible: true });
    }, 500);
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Meu Perfil' },
    { id: 'store', icon: Store, label: 'Assistência' },
    { id: 'security', icon: Shield, label: 'Segurança' },
    { id: 'notifications', icon: Bell, label: 'Notificações' },
    { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp API', highlight: true }
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
                    ? tab.highlight 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : tab.highlight
                      ? "text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/30 bg-card/50 glass"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent bg-card/50 glass"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <Card className="bg-card/50 glass border-border/50 shadow-xl overflow-hidden min-h-[500px]">
            <CardContent className="p-6 md:p-8">
              
              {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="border-b border-border/50 pb-4 mb-6">
                    <h3 className="text-xl font-bold tracking-tight">Informações Pessoais</h3>
                    <p className="text-sm text-muted-foreground">Atualize sua foto e dados pessoais.</p>
                  </div>
                  <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Nome Completo</label>
                      <Input type="text" defaultValue="Carlos Técnico" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">E-mail</label>
                      <Input type="email" defaultValue="carlos@techcell.com.br" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Telefone</label>
                      <Input type="tel" defaultValue="(11) 98765-4321" required />
                    </div>
                    
                    <div className="flex justify-end mt-4 pt-4 border-t border-border/50">
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
                  <div className="border-b border-border/50 pb-4 mb-6">
                    <h3 className="text-xl font-bold tracking-tight">Dados da Assistência</h3>
                    <p className="text-sm text-muted-foreground">As informações da sua loja física.</p>
                  </div>
                  <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Nome da Loja</label>
                      <Input type="text" defaultValue="TechCell Assistência" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Endereço</label>
                      <Input type="text" defaultValue="Av. Paulista, 1000 - SP" required />
                    </div>
                    
                    <div className="flex justify-end mt-4 pt-4 border-t border-border/50">
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
                   <div className="border-b border-border/50 pb-4 mb-6">
                    <h3 className="text-xl font-bold tracking-tight">Segurança</h3>
                    <p className="text-sm text-muted-foreground">Altere a sua senha e aumente a segurança.</p>
                  </div>
                  <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Senha Atual</label>
                      <Input type="password" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Nova Senha</label>
                      <Input type="password" required />
                    </div>
                    
                    <div className="flex justify-end mt-4 pt-4 border-t border-border/50">
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
                  <div className="border-b border-border/50 pb-4 mb-6">
                    <h3 className="text-xl font-bold tracking-tight">Notificações</h3>
                    <p className="text-sm text-muted-foreground">Escolha o que deseja receber no seu e-mail e app.</p>
                  </div>
                  <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-xl">
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
                    
                    <div className="flex justify-end mt-4 pt-4 border-t border-border/50">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isLoading ? 'Salvando...' : 'Salvar Preferências'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'whatsapp' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-foreground">Notificações por WhatsApp</h3>
                      <p className="text-sm text-muted-foreground mt-1">Configure quais eventos enviam mensagens automáticas para seus clientes.</p>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      <span className="font-semibold-plus text-emerald-500 text-sm">WhatsApp conectado</span>
                      <span className="text-muted-foreground text-xs ml-auto">Gerenciado pelo sistema</span>
                    </div>

                    <div className="flex flex-col gap-0">
                      <p className="text-[10px] font-semibold-plus uppercase tracking-widest text-muted-foreground mb-3">Eventos Automáticos</p>
                      {[
                        { key: 'checkin', label: 'Nova OS aberta', desc: 'Envia o link de acompanhamento assim que o check-in é concluído' },
                        { key: 'status', label: 'Atualização de status', desc: 'Notifica o cliente a cada mudança no andamento do conserto' },
                        { key: 'orcamento', label: 'Envio de orçamento', desc: 'Envia o orçamento com link de aprovação e recusa' },
                        { key: 'pronto', label: 'Aparelho pronto', desc: 'Avisa quando o aparelho está pronto para retirada' },
                        { key: 'reativacao', label: 'Reativação de inativos', desc: 'Mensagem automática para clientes sem visita há 6+ meses' },
                      ].map((item, i) => (
                        <div key={item.key} className={cn(
                          "flex justify-between items-center py-4",
                          i < 4 ? "border-b border-white/5" : "border-none"
                        )}>
                          <div>
                            <p className="font-semibold-plus text-sm text-foreground mb-1">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <ToggleSwitch
                            checked={notifications[item.key as keyof typeof notifications] ?? true}
                            onChange={(val) => setNotifications(prev => ({ ...prev, [item.key]: val }))}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/5">
                      <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)]">
                        {isLoading ? 'Salvando...' : 'Salvar preferências'}
                      </Button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                      <h4 className="font-semibold-plus text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Últimos Envios</h4>
                      <div className="rounded-xl border border-white/5 overflow-hidden bg-surface-2/30">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-surface-base">
                            <tr>
                              <th className="px-4 py-3 font-semibold-plus text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                              <th className="px-4 py-3 font-semibold-plus text-[10px] uppercase tracking-widest text-muted-foreground">Telefone</th>
                              <th className="px-4 py-3 font-semibold-plus text-[10px] uppercase tracking-widest text-muted-foreground">Tipo</th>
                              <th className="px-4 py-3 font-semibold-plus text-[10px] uppercase tracking-widest text-muted-foreground">Data</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {whatsappLogs.map(log => (
                              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                  {log.status === 'sent' ? (
                                    <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full text-[10px] font-bold">Enviado</span>
                                  ) : (
                                    <span className="bg-destructive/10 text-destructive px-2.5 py-1 rounded-full text-[10px] font-bold">Falhou</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.phone}</td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">{log.type}</td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">{log.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
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
