import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { STATUS_CONFIG, formatBRL } from '@/data/mock-data';
import { Search, Filter, FileText, Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/app/providers/AuthContext';
import { OsDrawer } from '@/features/dashboard/OsDrawer';
import KanbanBoard from '@/features/dashboard/KanbanBoard';
import { fetchOrdensServico } from '@/lib/services/osService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

const ServiceOrdersPage = () => {
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const s = searchParams.get('search');
    if (s !== null) setSearchTerm(s);
  }, [searchParams]);
  const [selectedOsId, setSelectedOsId] = useState<string | null>(null);
  const [baseOrders, setBaseOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');

  const handleMarkEntregue = (_osId: string) => {
    // mock action
    window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'OS marcada como Entregue', type: 'success' } }));
    // trigger refresh if we had a real backend call
  };

  const setOsForQuote = (_os: any) => {
    // mock action
    window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Iniciando orçamento', type: 'info' } }));
  };

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const data = await fetchOrdensServico(isDemoMode);
        setBaseOrders(data || []);
      } catch (error) {
        if (import.meta.env.DEV) console.error("Erro ao buscar ordens de serviço:", error);
        setBaseOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
    window.addEventListener('osUpdated', loadOrders);
    window.addEventListener('demoDataGenerated', loadOrders);
    return () => {
      window.removeEventListener('osUpdated', loadOrders);
      window.removeEventListener('demoDataGenerated', loadOrders);
    };
  }, [isDemoMode]);

  const filteredOrders = baseOrders.filter(os => {
    const matchSearch = os.numero_os.includes(searchTerm) || 
      os.customer_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.device_label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter.length === 0 || statusFilter.includes(os.status);
    return matchSearch && matchStatus;
  });

  const osHoje = baseOrders.filter(os => {
    const d = new Date(os.criado_em);
    const hoje = new Date();
    return d.getDate() === hoje.getDate() && d.getMonth() === hoje.getMonth();
  });
  const osAtrasadas = baseOrders.filter(os => {
    const horas = (Date.now() - new Date(os.atualizado_em).getTime()) / 3600000;
    return horas > 48 && !['entregue', 'orcamento_recusado'].includes(os.status);
  });
  const osPendentesOrcamento = baseOrders.filter(os => os.status === 'orcamento_enviado');

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Ordens de Serviço</h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as OS da sua assistência de forma ágil.</p>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3, gap: 2 }}>
          {(['lista', 'kanban'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: viewMode === mode ? 'rgba(37,99,235,0.7)' : 'transparent',
                color: viewMode === mode ? '#fff' : 'rgba(255,255,255,0.4)',
                border: 'none', cursor: 'pointer', transition: 'all 150ms', fontFamily: 'inherit',
                textTransform: 'capitalize',
              }}
            >
              {mode === 'lista' ? '☰ Lista' : '⊞ Kanban'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Em aberto', value: baseOrders.filter(o => o.status !== 'entregue').length, color: '#60A5FA', urgent: false },
          { label: 'Abertas hoje', value: osHoje.length, color: '#34D399', urgent: false },
          { label: 'Atrasadas (+48h)', value: osAtrasadas.length, color: '#F87171', urgent: osAtrasadas.length > 0 },
          { label: 'Aguardando aprovação', value: osPendentesOrcamento.length, color: '#FBBF24', urgent: false },
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

      <Card className="border-white/5 bg-surface-2/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-4 p-5 border-b border-white/5 bg-surface-floating/30">
            <div className="flex-1">
              <Input 
                icon={<Search className="w-4 h-4" />}
                type="text" 
                placeholder="Buscar por OS, cliente ou aparelho..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-surface-2 border-white/5 w-full md:max-w-md shadow-inner"
              />
            </div>
            <div className="relative shrink-0">
              <Button 
                variant="secondary" 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={statusFilter.length > 0 ? 'bg-primary/20 text-primary border-primary/30' : ''}
              >
                <Filter className="w-4 h-4 mr-2" /> Filtros {statusFilter.length > 0 && `(${statusFilter.length})`}
              </Button>
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-surface-1 border border-white/10 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Filtrar por Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                      const isActive = statusFilter.includes(key);
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            if (isActive) {
                              setStatusFilter(prev => prev.filter(s => s !== key));
                            } else {
                              setStatusFilter(prev => [...prev, key]);
                            }
                          }}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                          style={{
                            backgroundColor: isActive ? `${config.cor}30` : 'rgba(255,255,255,0.03)',
                            color: isActive ? config.cor : 'rgba(255,255,255,0.5)',
                            borderColor: isActive ? config.cor : 'rgba(255,255,255,0.1)',
                          }}
                        >
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                  {statusFilter.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setStatusFilter([])} className="text-xs h-8">
                        Limpar Filtros
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {viewMode === 'lista' && (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OS</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Aparelho</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Tempo no status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16 rounded-md ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-0 py-0">
                      <EmptyState 
                        icon={FileText} 
                        title="Nenhuma OS encontrada" 
                        description="Você ainda não tem ordens de serviço ou nenhuma corresponde à sua busca."
                        actionLabel={searchTerm ? "Limpar busca" : "Criar Nova OS"}
                        onAction={() => searchTerm ? setSearchTerm('') : navigate('/checkin')}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map(os => {
                    const statusColor = STATUS_CONFIG[os.status as keyof typeof STATUS_CONFIG]?.cor || 'var(--primary)';
                    return (
                      <TableRow 
                        key={os.id} 
                        className="cursor-pointer group"
                        onClick={() => setSelectedOsId(os.id)}
                      >
                        <TableCell className="font-semibold-plus text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                          #{os.numero_os}
                        </TableCell>
                        <TableCell className="font-semibold-plus text-foreground">
                          {os.customer_nome}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {os.device_label}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {os.valor_mao_obra || os.valor_pecas ? formatBRL((os.valor_mao_obra || 0) + (os.valor_pecas || 0)) : '-'}
                        </TableCell>
                        <TableCell>
                          <div 
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border"
                            style={{ 
                              backgroundColor: `${statusColor}15`, 
                              color: statusColor,
                              borderColor: `${statusColor}30`
                            }}
                          >
                            {STATUS_CONFIG[os.status as keyof typeof STATUS_CONFIG]?.label || os.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar name={os.technician_nome} className="w-6 h-6 text-[10px]" />
                            <span className="text-muted-foreground text-xs font-medium">{os.technician_nome.split(' ')[0]}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const horas = Math.floor((Date.now() - new Date(os.atualizado_em).getTime()) / 3600000);
                            const color = horas > 48 ? 'rgba(239,68,68,0.8)' : horas > 24 ? 'rgba(245,158,11,0.8)' : 'rgba(34,197,94,0.7)';
                            return (
                              <span style={{ fontSize: 12, fontWeight: 600, color, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={11} />
                                {horas < 1 ? 'agora' : horas < 24 ? `${horas}h` : `${Math.floor(horas/24)}d`}
                              </span>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              onClick={e => { e.stopPropagation(); setSelectedOsId(os.id); }}
                              style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                              Ver
                            </button>
                            {os.status === 'pronto' && (
                              <button
                                onClick={e => { e.stopPropagation(); handleMarkEntregue(os.id); }}
                                style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: 'rgba(34,197,94,0.85)', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                ✓ Entregue
                              </button>
                            )}
                            {os.status === 'em_analise' && (
                              <button
                                onClick={e => { e.stopPropagation(); setOsForQuote(os); }}
                                style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', color: '#93C5FD', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                💰 Orçar
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            </div>
          )}
          
          {viewMode === 'kanban' && (
            <div className="p-4 overflow-hidden h-[calc(100vh-320px)] min-h-[400px]">
              <KanbanBoard />
            </div>
          )}
        </CardContent>
      </Card>

      <OsDrawer 
        osId={selectedOsId} 
        onClose={() => setSelectedOsId(null)} 
      />
    </DashboardLayout>
  );
};

export default ServiceOrdersPage;
