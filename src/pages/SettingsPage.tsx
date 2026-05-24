import { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Save, Store, User, Shield, Bell, Loader2, MessageCircle, Send } from 'lucide-react';
import { Toast, type ToastType } from '../components/ui/Toast';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { sendWhatsAppMessage } from '../services/whatsappService';

const SettingsPage = () => {
  const { tenant } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [toastConfig, setToastConfig] = useState<{ message: string, type: ToastType, visible: boolean }>({ message: '', type: 'info', visible: false });

  // WhatsApp states
  const [provider, setProvider] = useState<'none' | 'evolution' | 'zapi'>('none');
  const [isTesting, setIsTesting] = useState(false);
  const [whatsappLogs] = useState<{id: string, date: string, type: string, phone: string, status: string, provider: string}[]>([
    { id: '1', date: 'Há 5 min', type: 'checkin', phone: '5592999999999', status: 'sent', provider: 'evolution' },
    { id: '2', date: 'Há 2 hrs', type: 'orcamento', phone: '5592988888888', status: 'sent', provider: 'evolution' },
    { id: '3', date: 'Há 1 dia', type: 'status_update', phone: '5592977777777', status: 'failed', provider: 'evolution' },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setToastConfig({ message: 'Configurações salvas com sucesso!', type: 'success', visible: true });
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Configurações</h1>
        <p className="text-muted" style={{ margin: 0 }}>Gerencie as preferências da sua conta e da assistência</p>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('profile')} style={{ justifyContent: 'flex-start' }}>
            <User size={18} /> Meu Perfil
          </button>
          <button className={`btn ${activeTab === 'store' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('store')} style={{ justifyContent: 'flex-start' }}>
            <Store size={18} /> Dados da Assistência
          </button>
          <button className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('security')} style={{ justifyContent: 'flex-start' }}>
            <Shield size={18} /> Segurança
          </button>
          <button className={`btn ${activeTab === 'notifications' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('notifications')} style={{ justifyContent: 'flex-start' }}>
            <Bell size={18} /> Notificações
          </button>
          <button className={`btn ${activeTab === 'whatsapp' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('whatsapp')} style={{ justifyContent: 'flex-start', borderColor: '#25D366', color: activeTab === 'whatsapp' ? '#fff' : '#25D366', backgroundColor: activeTab === 'whatsapp' ? '#25D366' : 'transparent' }}>
            <MessageCircle size={18} /> WhatsApp API
          </button>
        </div>

        <div style={{ flex: 1, minWidth: '300px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '32px', borderRadius: 'var(--radius-lg)' }}>
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Informações Pessoais</h3>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nome Completo</label>
                  <input type="text" defaultValue="Carlos Técnico" required style={{ padding: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>E-mail</label>
                  <input type="email" defaultValue="carlos@techcell.com.br" required style={{ padding: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Telefone</label>
                  <input type="tel" defaultValue="(11) 98765-4321" required style={{ padding: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'store' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Dados da Assistência</h3>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nome da Loja</label>
                  <input type="text" defaultValue="TechCell Assistência" required style={{ padding: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Endereço</label>
                  <input type="text" defaultValue="Av. Paulista, 1000 - SP" required style={{ padding: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Segurança</h3>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Senha Atual</label>
                  <input type="password" required style={{ padding: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nova Senha</label>
                  <input type="password" required style={{ padding: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isLoading ? 'Salvando...' : 'Atualizar Senha'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Notificações</h3>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span style={{ fontSize: '14px' }}>Receber alertas de estoque baixo</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span style={{ fontSize: '14px' }}>Notificar quando OS for aprovada</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span style={{ fontSize: '14px' }}>Resumo diário por e-mail</span>
                  </label>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isLoading ? 'Salvando...' : 'Salvar Preferências'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Automação de WhatsApp</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: provider !== 'none' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '20px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: provider !== 'none' ? '#10b981' : '#ef4444' }}></div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: provider !== 'none' ? '#10b981' : '#ef4444' }}>
                    {provider !== 'none' ? 'Configurado' : 'Desconectado'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div 
                  onClick={() => setProvider('evolution')}
                  style={{ flex: 1, padding: '20px', borderRadius: '12px', border: `2px solid ${provider === 'evolution' ? 'var(--color-primary)' : 'var(--border-subtle)'}`, cursor: 'pointer', backgroundColor: provider === 'evolution' ? 'var(--bg-input)' : 'transparent', transition: 'all 0.2s' }}
                >
                  <h4 style={{ margin: '0 0 8px', display: 'flex', justifyContent: 'space-between' }}>Evolution API <Badge variant="success">Recomendada</Badge></h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Open source, self-hosted, gratuita e ilimitada.</p>
                </div>
                <div 
                  onClick={() => setProvider('zapi')}
                  style={{ flex: 1, padding: '20px', borderRadius: '12px', border: `2px solid ${provider === 'zapi' ? 'var(--color-primary)' : 'var(--border-subtle)'}`, cursor: 'pointer', backgroundColor: provider === 'zapi' ? 'var(--bg-input)' : 'transparent', transition: 'all 0.2s' }}
                >
                  <h4 style={{ margin: '0 0 8px', display: 'flex', justifyContent: 'space-between' }}>Z-API <Badge variant="info">Paga</Badge></h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>SaaS hospedado, oficial e de alta disponibilidade.</p>
                </div>
              </div>

              {provider === 'evolution' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', padding: '20px', backgroundColor: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>URL da sua instância (Global)</label>
                    <input type="text" placeholder="https://api.sua-evolution.com" style={{ padding: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Global API Key</label>
                    <input type="password" placeholder="••••••••••••••••" style={{ padding: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nome da Instância</label>
                    <input type="text" placeholder="techos_whatsapp" style={{ padding: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
              )}

              {provider === 'zapi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', padding: '20px', backgroundColor: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Instance ID</label>
                    <input type="text" placeholder="Ex: 3B9AD9A..." style={{ padding: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Token</label>
                    <input type="password" placeholder="••••••••••••••••" style={{ padding: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Client-Token</label>
                    <input type="password" placeholder="••••••••••••••••" style={{ padding: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
              )}

              {provider !== 'none' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    <h4 style={{ margin: '0', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Eventos Automáticos</h4>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span style={{ fontSize: '14px' }}>Enviar Check-in quando nova OS for aberta</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span style={{ fontSize: '14px' }}>Enviar atualizações quando o Status mudar</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span style={{ fontSize: '14px' }}>Enviar cobrança para Orçamento</span>
                    </label>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ flex: 1 }}
                      onClick={async () => {
                        if (!tenant) return;
                        setIsTesting(true);
                        const result = await sendWhatsAppMessage({
                          tenantId: tenant.id,
                          phone: tenant.telefone || '5511999999999',
                          message: '✅ TechOS conectado com sucesso! Suas notificações automáticas estão prontas.',
                          messageType: 'teste'
                        });
                        setIsTesting(false);
                        if (result.success) {
                          setToastConfig({ message: 'Mensagem de teste enviada! Verifique seu celular.', type: 'success', visible: true });
                        } else {
                          setToastConfig({ message: `Erro: Edge Function bloqueou (Modo Demo) ou credenciais inválidas.`, type: 'error', visible: true });
                        }
                      }}
                      disabled={isTesting}
                    >
                      {isTesting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      Testar Conexão
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1, backgroundColor: '#25D366', borderColor: '#25D366' }} onClick={handleSave}>
                      Salvar Integração
                    </button>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '32px 0' }} />

                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Últimos Envios (Log)</h3>
                  <div style={{ borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead style={{ backgroundColor: 'var(--bg-input)' }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Telefone</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Tipo</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {whatsappLogs.map(log => (
                          <tr key={log.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px' }}>
                              {log.status === 'sent' ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Badge variant="success">Enviado</Badge>
                                </div>
                              ) : (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Badge variant="danger">Falha</Badge>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{log.phone}</td>
                            <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{log.type}</td>
                            <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{log.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
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
