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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-600">
          {[
            { label: 'Total de Clientes', value: localCustomers.length, color: '#60A5FA', urgent: false },
            { label: 'Clientes VIP', value: clientesVip, color: '#FBBF24', urgent: false },
            { label: 'Inativos (+6 meses)', value: clientesInativos, color: '#F87171', urgent: clientesInativos > 0 },
            { label: 'LTV Médio', value: formatBRL(ltvMedio), color: '#34D399', urgent: false },
          ].map(card => (
            <div key={card.label} className={`hover-lift rounded-[10px] py-3 px-4 border ${card.urgent ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/5"}`}>
              <div className="text-[10px] text-white/35 mb-1 uppercase tracking-widest font-semibold">
                {card.label}
              </div>
              <div className="text-[26px] font-extrabold leading-none font-syne" style={{ color: card.color }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-4 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-4 px-[18px] flex gap-3.5">
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
            
            <div className="flex gap-1.5 flex-wrap items-center">
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
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold capitalize transition-all border"
                    style={{
                      borderColor: segmento === s ? colors[s] : 'rgba(255,255,255,0.07)',
                      background: segmento === s ? bg[s] : 'transparent',
                      color: segmento === s ? colors[s] : 'rgba(255,255,255,0.35)',
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
              className="bg-white/5 border border-white/10 rounded-lg px-3 text-[13px] text-white/80 outline-none cursor-pointer"
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
                <div key={c.id} className="bg-white/5 border border-white/5 rounded-[14px] overflow-hidden">
                  <div
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    className="p-4 px-[18px] flex items-center gap-3.5 cursor-pointer transition-colors hover:bg-white/5"
                  >
                    <Avatar name={c.nome} className="w-10 h-10 text-sm shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white/90">{c.nome}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: seg.bg, color: seg.color }}>
                          {seg.label}
                        </span>
                      </div>
                      <div className="flex gap-3 text-[11px] text-white/40">
                        <span className="flex items-center gap-1"><Phone size={10} /> {c.telefone}</span>
                        {c.email && <span className="flex items-center gap-1"><Mail size={10} /> {c.email}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-bold text-green-500/85 tracking-tight">
                        {formatBRL(c.totalGasto)}
                      </div>
                      <div className="text-[11px] text-white/30">{c.totalOs} OS</div>
                    </div>
                  </div>

                  {expandedId === c.id && (
                    <div className="border-t border-white/5 p-4 px-[18px] bg-black/20 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-3 gap-2.5 mb-4">
                        <div className="text-center p-3 bg-white/5 rounded-[10px] border border-white/5">
                          <div className="text-xl font-bold text-white/85 font-syne">{c.totalOs}</div>
                          <div className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">OS totais</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-[10px] border border-white/5">
                          <div className="text-xl font-bold text-green-500/85 font-syne">{formatBRL(c.totalGasto)}</div>
                          <div className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">LTV Gasto</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-[10px] border border-white/5">
                          <div className={`text-xl font-bold font-syne ${diasSemVisita !== null && diasSemVisita > 90 ? 'text-red-400/85' : 'text-white/80'}`}>
                            {diasSemVisita !== null ? `${diasSemVisita}d` : '—'}
                          </div>
                          <div className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Sem visita</div>
                        </div>
                      </div>

                      {clienteOs.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2">
                            Últimas OS
                          </p>
                          <div className="flex flex-col gap-1">
                            {clienteOs.slice(0, 3).map(os => (
                              <div key={os.id} className="flex justify-between items-center py-2 px-3 bg-white/[0.015] rounded-lg">
                                <span className="text-xs text-blue-400 font-mono font-bold">#{os.numeroOs}</span>
                                <span className="text-xs text-white/55 flex-1 mx-3 overflow-hidden text-ellipsis whitespace-nowrap">
                                  {os.deviceLabel}
                                </span>
                                <span className="text-xs font-semibold text-green-500/80">
                                  {formatBRL((os.valorMaoObra || 0) + (os.valorPecas || 0))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const msg = encodeURIComponent(`Olá ${c.nome}! Tudo bem? Aqui é da TecnoFix. Faz um tempo que você não passa por aqui — estamos à disposição para qualquer manutenção! 😊`);
                            window.open(`https://wa.me/${c.telefone.replace(/\D/g,'')}?text=${msg}`, '_blank');
                          }}
                          className="flex-1 flex justify-center items-center gap-1.5 p-2.5 rounded-lg text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-500/90 cursor-pointer transition-all hover:bg-green-500/20"
                        >
                          <MessageCircle size={14} /> Reativar via WhatsApp
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/checkin?customer_id=${c.id}`);
                          }}
                          className="flex-1 flex justify-center items-center gap-1.5 p-2.5 rounded-lg text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 cursor-pointer transition-all hover:bg-blue-500/20"
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/45 uppercase tracking-widest">
                  CEP (opcional)
                </label>
                <div className="relative">
                  <input
                    value={cep}
                    onChange={e => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    className={`w-full py-2.5 px-3.5 bg-white/5 border rounded-[10px] text-white/85 text-sm outline-none ${cepError ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {cepLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={14} className="text-white/30 animate-spin" />
                    </div>
                  )}
                </div>
                {cepError && <span className="text-[11px] text-red-500/80">{cepError}</span>}
              </div>

              {endereco && (
                <div className="p-2.5 px-3.5 rounded-[10px] bg-green-500/5 border border-green-500/15 text-[13px] text-green-500/85 flex items-center gap-2">
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
