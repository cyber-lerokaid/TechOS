import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Archive, Search, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { fetchOrdensServico } from '@/lib/services/osService';
import { STATUS_CONFIG, formatBRL, type ServiceOrder } from '@/data/mock-data';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { OsDrawer } from '@/features/dashboard/OsDrawer';

const HistoricoPage = () => {
  const { isDemoMode } = useAuth();
  const [allOrders, setAllOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOsId, setSelectedOsId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'data' | 'valor' | 'cliente'>('data');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchOrdensServico(isDemoMode);
      setAllOrders(data || []);
      setIsLoading(false);
    };
    load();
    window.addEventListener('osUpdated', load);
    window.addEventListener('demoDataGenerated', load);
    return () => {
      window.removeEventListener('osUpdated', load);
      window.removeEventListener('demoDataGenerated', load);
    };
  }, [isDemoMode]);

  const filteredAndSorted = useMemo(() => {
    const q = searchTerm.toLowerCase();
    let result = allOrders.filter(os => {
      const matchSearch =
        os.numero_os.includes(searchTerm) ||
        os.customer_nome?.toLowerCase().includes(q) ||
        os.customer_telefone?.includes(searchTerm) ||
        os.device_label?.toLowerCase().includes(q) ||
        (os as any).customer_email?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'todos' || os.status === statusFilter;
      return matchSearch && matchStatus;
    });

    result.sort((a, b) => {
      let valA: any, valB: any;
      if (sortField === 'data') { valA = new Date(a.criado_em).getTime(); valB = new Date(b.criado_em).getTime(); }
      if (sortField === 'valor') { valA = (a.valor_mao_obra || 0) + (a.valor_pecas || 0); valB = (b.valor_mao_obra || 0) + (b.valor_pecas || 0); }
      if (sortField === 'cliente') { valA = a.customer_nome; valB = b.customer_nome; }
      if (sortDir === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return result;
  }, [allOrders, searchTerm, statusFilter, sortField, sortDir]);

  const totalFaturado = filteredAndSorted.reduce((acc, os) =>
    acc + (os.valor_mao_obra || 0) + (os.valor_pecas || 0), 0
  );

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronDown size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />;
  };

  const exportarCSV = () => {
    const headers = ['Data', 'OS', 'Cliente', 'Telefone', 'Aparelho', 'Status', 'Valor Total'];
    const rows = filteredAndSorted.map(os => [
      new Date(os.criado_em).toLocaleDateString('pt-BR'),
      `#${os.numero_os}`,
      os.customer_nome,
      os.customer_telefone,
      os.device_label,
      STATUS_CONFIG[os.status as keyof typeof STATUS_CONFIG]?.label || os.status,
      (os.valor_mao_obra || 0) + (os.valor_pecas || 0),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-os-${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-[fadeIn_400ms_ease]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Histórico</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading ? '...' : `${allOrders.length} OS registradas • ${formatBRL(totalFaturado)} faturado no total filtrado`}
          </p>
        </div>
        <Button variant="outline" onClick={exportarCSV}>
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      {!isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 24 }} className="animate-[fadeIn_500ms_ease]">
          {[
            { label: 'Total de OS', value: allOrders.length.toString(), color: 'rgba(37,99,235,0.85)' },
            { label: 'Total Faturado', value: formatBRL(allOrders.reduce((acc, os) => acc + (os.valor_mao_obra || 0) + (os.valor_pecas || 0), 0)), color: 'rgba(34,197,94,0.85)' },
            { label: 'Ticket Médio', value: allOrders.length > 0 ? formatBRL(allOrders.reduce((acc, os) => acc + (os.valor_mao_obra || 0) + (os.valor_pecas || 0), 0) / allOrders.filter(o => (o.valor_mao_obra || 0) + (o.valor_pecas || 0) > 0).length) : 'R$ 0,00', color: 'rgba(6,182,212,0.85)' },
            { label: 'Clientes Únicos', value: new Set(allOrders.map(o => o.customer_id)).size.toString(), color: 'rgba(245,158,11,0.85)' },
          ].map(card => (
            <div key={card.label} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '14px 18px',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: card.color, letterSpacing: '-0.02em', fontFamily: 'Syne, sans-serif' }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className="border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-[slideInUp_500ms_ease]">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-white/5">
            <div className="flex-1">
              <Input
                icon={<Search className="w-4 h-4" />}
                placeholder="Buscar por #OS, nome, telefone, email ou aparelho..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-surface-2 border-white/5 w-full"
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {['todos', 'pronto', 'entregue', 'em_bancada', 'aguardando_peca'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    border: `1px solid ${statusFilter === s ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.07)'}`,
                    background: statusFilter === s ? 'rgba(37,99,235,0.12)' : 'transparent',
                    color: statusFilter === s ? '#93C5FD' : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer', transition: 'all 150ms', fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s === 'todos' ? 'Todos' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('data')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Data <SortIcon field="data" />
                    </span>
                  </TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('cliente')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Cliente <SortIcon field="cliente" />
                    </span>
                  </TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Aparelho</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('valor')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Valor <SortIcon field="valor" />
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredAndSorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <EmptyState icon={Archive} title="Nenhuma OS encontrada" description="Tente ajustar os filtros ou o termo de busca." actionLabel={searchTerm || statusFilter !== 'todos' ? 'Limpar Filtros' : undefined} onAction={() => {setSearchTerm(''); setStatusFilter('todos');}} />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSorted.map(os => {
                    const total = (os.valor_mao_obra || 0) + (os.valor_pecas || 0);
                    const statusConfig = STATUS_CONFIG[os.status as keyof typeof STATUS_CONFIG];
                    return (
                      <TableRow
                        key={os.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedOsId(os.id)}
                      >
                        <TableCell style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', whiteSpace: 'nowrap' }}>
                          {new Date(os.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#60A5FA', fontFamily: 'monospace' }}>
                            #{os.numero_os}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar name={os.customer_nome} className="w-6 h-6 text-[9px]" />
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
                              {os.customer_nome}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', fontFamily: 'monospace' }}>
                          {os.customer_telefone}
                        </TableCell>
                        <TableCell style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {os.device_label}
                        </TableCell>
                        <TableCell>
                          <Avatar name={os.technician_nome} className="w-6 h-6 text-[9px]" />
                        </TableCell>
                        <TableCell>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                            background: `${statusConfig?.cor}18`,
                            color: statusConfig?.cor || 'rgba(255,255,255,0.5)',
                            border: `1px solid ${statusConfig?.cor}30`,
                          }}>
                            {statusConfig?.label || os.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 13, fontWeight: 700, color: total > 0 ? 'rgba(34,197,94,0.85)' : 'rgba(255,255,255,0.25)' }}>
                            {total > 0 ? formatBRL(total) : '—'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && filteredAndSorted.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)' }}>
                {filteredAndSorted.length} resultado{filteredAndSorted.length !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(34,197,94,0.8)' }}>
                Total listado: {formatBRL(filteredAndSorted.reduce((acc, os) => acc + (os.valor_mao_obra || 0) + (os.valor_pecas || 0), 0))}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <OsDrawer osId={selectedOsId} onClose={() => setSelectedOsId(null)} />
    </DashboardLayout>
  );
};

export default HistoricoPage;
