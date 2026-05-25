import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users, Plus, Search, Phone, Mail, X, MapPin, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { fetchOrdensServico } from '@/lib/services/osService';
import { useCustomerList } from '@/shared/lib/hooks/customers/useCustomerList';
import { useCreateCustomer } from '@/shared/lib/hooks/customers/useCreateCustomer';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { buscarCep, formatCep, formatPhone } from '@/lib/services/viaCepService';
import { formatBRL } from '@/data/mock-data';

const CustomersPage = () => {
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  useEffect(() => {
    const s = searchParams.get('search');
    if (s !== null) setSearchTerm(s);
  }, [searchParams]);

  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const { data: remoteCustomers, isLoading: isCustomersLoading } = useCustomerList();
  const createCustomerMutation = useCreateCustomer();
  const localCustomers = remoteCustomers || [];

  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [isOsLoading, setIsOsLoading] = useState(true);
  const isLoading = isCustomersLoading || isOsLoading;
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recente' | 'valor' | 'nome'>('recente');
  const [segmento, setSegmento] = useState<string>('todos');

  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);
    setCepError('');
    
    if (formatted.replace(/\D/g, '').length === 8) {
      setCepLoading(true);
      const result = await buscarCep(formatted);
      setCepLoading(false);
      if (result) {
        setEndereco(`${result.logradouro}, ${result.bairro} — ${result.localidade}/${result.uf}`);
      } else {
        setCepError('CEP não encontrado');
      }
    }
  };

  useEffect(() => {
    setIsOsLoading(true);
    const load = async () => {
      const osData = await fetchOrdensServico(isDemoMode);
      setAllOrders(osData || []);
      setIsOsLoading(false);
    };
    load();
  }, [isDemoMode]);

  const getSegmento = (customer: any) => {
    if (customer.totalGasto >= 500) return { id: 'vip', label: 'VIP', color: '#FBBF24', bg: 'rgba(251,191,36,0.10)' };
    if (customer.totalOs >= 3) return { id: 'fiel', label: 'Fiel', color: '#34D399', bg: 'rgba(52,211,153,0.10)' };
    if (customer.totalOs === 0) return { id: 'novo', label: 'Novo', color: '#60A5FA', bg: 'rgba(96,165,250,0.10)' };
    const mesesSemVisita = (Date.now() - new Date(customer.criadoEm).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (mesesSemVisita > 6 && customer.totalOs > 0) return { id: 'inativo', label: 'Inativo', color: '#F87171', bg: 'rgba(248,113,113,0.10)' };
    return { id: 'regular', label: 'Regular', color: '#A78BFA', bg: 'rgba(167,139,250,0.10)' };
  };

  const filteredCustomers = localCustomers.filter(c => {
    const matchSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.telefone.includes(searchTerm) ||
                        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const seg = getSegmento(c);
    const matchSeg = segmento === 'todos' || seg.id === segmento;
    return matchSearch && matchSeg;
  });

  const sorted = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'valor') return b.totalGasto - a.totalGasto;
    if (sortBy === 'nome') return a.nome.localeCompare(b.nome);
    return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
  });

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomerMutation.mutateAsync({
        nome: newCustomerName,
        telefone: newCustomerPhone,
        email: newCustomerEmail || null,
      });
      setNewCustomerName(''); 
      setNewCustomerPhone(''); 
      setNewCustomerEmail('');
      setCep('');
      setEndereco('');
      setIsNewCustomerModalOpen(false);
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Cliente cadastrado com sucesso!', type: 'success' } 
      }));
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: err.message || 'Erro ao cadastrar cliente', type: 'error' } 
      }));
    }
  };

  // CRM Summary calculations
  const clientesVip = localCustomers.filter(c => c.totalGasto >= 500).length;
  const clientesInativos = localCustomers.filter(c => {
    const ultimaOs = allOrders.filter(os => os.customer_id === c.id).sort((a,b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())[0];
    if (!ultimaOs) return false;
    const dias = (Date.now() - new Date(ultimaOs.criadoEm).getTime()) / (1000 * 60 * 60 * 24);
    return dias > 180;
  }).length;
  const ltvMedio = localCustomers.length > 0 ? localCustomers.reduce((acc, c) => acc + c.totalGasto, 0) / localCustomers.length : 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie a base de clientes da assistência</p>
        </div>
        <Button variant="premium" onClick={() => setIsNewCustomerModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Novo Cliente
        </Button>
      </div>

      {!isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10, marginBottom: 24 }} className="animate-in fade-in slide-in-from-bottom-4 duration-600">
          {[
            { label: 'Total de Clientes', value: localCustomers.length, color: '#60A5FA', urgent: false },
            { label: 'Clientes VIP', value: clientesVip, color: '#FBBF24', urgent: false },
            { label: 'Inativos (+6 meses)', value: clientesInativos, color: '#F87171', urgent: clientesInativos > 0 },
            { label: 'LTV Médio', value: formatBRL(ltvMedio), color: '#34D399', urgent: false },
          ].map(card => (
            <div key={card.label} style={{
              background: card.urgent ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${card.urgent ? 'rgba(239,68,68,0.20)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 10, padding: '12px 16px',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: card.color, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-4 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 14 }}>
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : localCustomers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <EmptyState 
            icon={Users}
            title="Nenhum cliente cadastrado"
            description="Você ainda não adicionou nenhum cliente à sua base. Comece cadastrando o primeiro cliente."
            actionLabel="Cadastrar Cliente"
            onAction={() => setIsNewCustomerModalOpen(true)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input 
                icon={<Search className="w-4 h-4" />}
                type="text" 
                placeholder="Buscar por nome, telefone ou email..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-surface-2 border-white/5 w-full shadow-inner"
              />
            </div>
            
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {['todos', 'vip', 'fiel', 'regular', 'inativo', 'novo'].map(s => {
                const colors: Record<string, string> = {
                  'todos': '#93C5FD', 'vip': '#FBBF24', 'fiel': '#34D399', 'regular': '#A78BFA', 'inativo': '#F87171', 'novo': '#60A5FA'
                };
                const bg: Record<string, string> = {
                  'todos': 'rgba(37,99,235,0.12)', 'vip': 'rgba(251,191,36,0.10)', 'fiel': 'rgba(52,211,153,0.10)', 'regular': 'rgba(167,139,250,0.10)', 'inativo': 'rgba(248,113,113,0.10)', 'novo': 'rgba(96,165,250,0.10)'
                };
                return (
                  <button
                    key={s}
                    onClick={() => setSegmento(s)}
                    style={{
                      padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      border: `1px solid ${segmento === s ? colors[s] : 'rgba(255,255,255,0.07)'}`,
                      background: segmento === s ? bg[s] : 'transparent',
                      color: segmento === s ? colors[s] : 'rgba(255,255,255,0.35)',
                      cursor: 'pointer', transition: 'all 150ms', fontFamily: 'inherit', textTransform: 'capitalize'
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>

            <select 
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '0 12px', color: 'rgba(255,255,255,0.8)',
                fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              <option value="recente">Mais recentes</option>
              <option value="valor">Maior LTV</option>
              <option value="nome">A-Z</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 pb-8">
            {sorted.map(c => {
              const seg = getSegmento(c);
              const clienteOs = allOrders.filter(os => os.customer_id === c.id);
              const ultimaOS = clienteOs.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())[0];
              const diasSemVisita = ultimaOS
                ? Math.floor((Date.now() - new Date(ultimaOS.criadoEm).getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
                  <div
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'background 150ms' }}
                    className="hover:bg-white/[0.02]"
                  >
                    <Avatar name={c.nome} className="w-10 h-10 text-sm shadow-sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.88)' }}>{c.nome}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: seg.bg, color: seg.color }}>
                          {seg.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                        <span className="flex items-center gap-1"><Phone size={10} /> {c.telefone}</span>
                        {c.email && <span className="flex items-center gap-1"><Mail size={10} /> {c.email}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(34,197,94,0.85)', letterSpacing: '-0.02em' }}>
                        {formatBRL(c.totalGasto)}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{c.totalOs} OS</div>
                    </div>
                  </div>

                  {expandedId === c.id && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 18px', background: 'rgba(0,0,0,0.2)' }} className="animate-in slide-in-from-top-2 duration-300">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 16 }}>
                        <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontFamily: 'Syne, sans-serif' }}>{c.totalOs}</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>OS totais</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: 'rgba(34,197,94,0.85)', fontFamily: 'Syne, sans-serif' }}>{formatBRL(c.totalGasto)}</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>LTV Gasto</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: diasSemVisita !== null && diasSemVisita > 90 ? 'rgba(248,113,113,0.85)' : 'rgba(255,255,255,0.8)', fontFamily: 'Syne, sans-serif' }}>
                            {diasSemVisita !== null ? `${diasSemVisita}d` : '—'}
                          </div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>Sem visita</div>
                        </div>
                      </div>

                      {clienteOs.length > 0 && (
                        <div className="mb-4">
                          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                            Últimas OS
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {clienteOs.slice(0, 3).map(os => (
                              <div key={os.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.015)', borderRadius: 8 }}>
                                <span style={{ fontSize: 12, color: '#60A5FA', fontFamily: 'monospace', fontWeight: 700 }}>#{os.numeroOs}</span>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', flex: 1, margin: '0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {os.deviceLabel}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(34,197,94,0.8)' }}>
                                  {formatBRL((os.valorMaoObra || 0) + (os.valorPecas || 0))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const msg = encodeURIComponent(`Olá ${c.nome}! Tudo bem? Aqui é da TecnoFix. Faz um tempo que você não passa por aqui — estamos à disposição para qualquer manutenção! 😊`);
                            window.open(`https://wa.me/${c.telefone.replace(/\D/g,'')}?text=${msg}`, '_blank');
                          }}
                          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: 'rgba(34,197,94,0.9)', cursor: 'pointer', transition: 'all 150ms' }}
                          className="hover:bg-green-500/20"
                        >
                          <MessageCircle size={14} /> Reativar via WhatsApp
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/checkin?customer_id=${c.id}`);
                          }}
                          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', color: '#93C5FD', cursor: 'pointer', transition: 'all 150ms' }}
                          className="hover:bg-blue-500/20"
                        >
                          <Plus size={14} /> Nova OS para este cliente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {sorted.length === 0 && (
              <div className="text-center py-12 bg-surface-2/30 rounded-xl border border-dashed border-white/10">
                <Users className="w-8 h-8 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">Nenhum cliente atende aos filtros.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.6)] rounded-2xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-surface-floating/30">
              <h2 className="text-xl font-bold tracking-tight">Novo Cliente</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsNewCustomerModalOpen(false)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleCreateCustomer} className="p-6 flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Nome Completo</label>
                <Input type="text" required value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Telefone</label>
                <Input type="tel" required value={newCustomerPhone} onChange={e => setNewCustomerPhone(formatPhone(e.target.value))} placeholder="(99) 99999-9999" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">E-mail</label>
                <Input type="email" value={newCustomerEmail} onChange={e => setNewCustomerEmail(e.target.value)} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  CEP (opcional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={cep}
                    onChange={e => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    style={{
                      width: '100%', padding: '10px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${cepError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10, color: 'rgba(255,255,255,0.85)',
                      fontSize: 14, fontFamily: 'inherit', outline: 'none',
                    }}
                  />
                  {cepLoading && (
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                      <Loader2 size={14} style={{ color: 'rgba(255,255,255,0.3)', animation: 'spin 1s linear infinite' }} />
                    </div>
                  )}
                </div>
                {cepError && <span style={{ fontSize: 11, color: 'rgba(239,68,68,0.8)' }}>{cepError}</span>}
              </div>

              {endereco && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(34,197,94,0.06)',
                  border: '1px solid rgba(34,197,94,0.15)',
                  fontSize: 13, color: 'rgba(34,197,94,0.85)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <MapPin size={13} />
                  {endereco}
                </div>
              )}
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsNewCustomerModalOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="default">Salvar Cliente</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomersPage;
