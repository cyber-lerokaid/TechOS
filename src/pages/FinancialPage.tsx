import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { BarChart2, Download, DollarSign, ArrowUpRight, ArrowDownRight, Search, FileText, PieChart as PieChartIcon } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { formatBRL, type ServiceOrder, STATUS_CONFIG } from '@/data/mock-data';
import { Toast, type ToastType } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { calcularFinanceiro, getTransacoesPorPeriodo } from '@/lib/financialCalc';
import { fetchOrdensServico } from '@/lib/services/osService';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn } from '@/lib/cn';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const FinancialPage = () => {
  const { isDemoMode } = useAuth();
  const [period, setPeriod] = useState('30d');
  const [toastConfig, setToastConfig] = useState<{ message: string, type: ToastType, visible: boolean }>({ message: '', type: 'info', visible: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [showDRE, setShowDRE] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchOrdensServico(isDemoMode);
      setOrders(data || []);
    };
    loadOrders();
    window.addEventListener('osUpdated', loadOrders);
    window.addEventListener('demoDataGenerated', loadOrders);
    return () => {
      window.removeEventListener('osUpdated', loadOrders);
      window.removeEventListener('demoDataGenerated', loadOrders);
    };
  }, [isDemoMode]);

  const summary = calcularFinanceiro(orders, period, isDemoMode);
  const transacoes = getTransacoesPorPeriodo(orders, period, isDemoMode);

  const filteredOrders = transacoes.filter(os => 
    os.numero_os.includes(searchTerm) || 
    os.customer_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const headers = ['Data', 'OS', 'Cliente', 'Aparelho', 'Status', 'Mão de Obra', 'Peças', 'Total'];
    const rows = filteredOrders.map(os => {
      const statusLabel = STATUS_CONFIG[os.status as keyof typeof STATUS_CONFIG]?.label || os.status;
      const total = (os.valor_mao_obra || 0) + (os.valor_pecas || 0);
      return [
        new Date(os.atualizado_em).toLocaleDateString(),
        os.numero_os,
        `"${os.customer_nome}"`,
        `"${os.device_label}"`,
        statusLabel,
        os.valor_mao_obra || 0,
        os.valor_pecas || 0,
        total
      ];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'financeiro.csv'; a.click();
    URL.revokeObjectURL(url);
    setToastConfig({ message: 'Relatório exportado com sucesso!', type: 'success', visible: true });
  };

  // Prepare PieChart data
  const chartData = transacoes.reduce((acc, os) => {
    // deduce type from device_label for mock purposes or use device_tipo if exists
    let tipo = 'Outro';
    const label = os.device_label.toLowerCase();
    if (label.includes('iphone') || label.includes('samsung') || label.includes('motorola')) tipo = 'Celular';
    else if (label.includes('macbook') || label.includes('notebook') || label.includes('dell')) tipo = 'Notebook';
    else if (label.includes('pc') || label.includes('desktop')) tipo = 'Desktop';

    const valor = (os.valor_mao_obra || 0) + (os.valor_pecas || 0);
    const existing = acc.find(item => item.name === tipo);
    if (existing) {
      existing.value += valor;
    } else {
      acc.push({ name: tipo, value: valor });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  const projecaoReceita = summary.receita_total * 1.15; // Estimativa simples

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Controle de caixa, receitas e despesas da sua assistência</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="bg-surface-2/50 backdrop-blur-md">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="flex gap-2 items-center overflow-x-auto pb-4 hide-scrollbar">
        {['Hoje', '7d', '15d', '30d', 'Este Mês'].map(p => (
          <button 
            key={p} 
            onClick={() => setPeriod(p)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
              period === p 
                ? "bg-primary text-primary-foreground shadow-md border border-primary" 
                : "bg-surface-2/80 backdrop-blur-md text-muted-foreground hover:text-foreground border border-white/5 hover:border-white/20"
            )}
          >
            {p}
          </button>
        ))}
        <button 
          onClick={() => setShowDRE(!showDRE)}
          className="ml-auto px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border border-blue-500/50 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
        >
          {showDRE ? 'Ocultar DRE' : 'Ver DRE Simplificado'}
        </button>
      </div>

      {showDRE && (
        <Card className="mb-6 border-white/5 bg-surface-2/80 backdrop-blur-xl animate-in slide-in-from-top-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-primary" /> DRE Simplificado (Estimativa)</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Receita Bruta (Serviços + Peças)</span>
                <span className="font-semibold">{formatBRL(summary.receita_total)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Custo de Peças (CPV)</span>
                <span className="font-semibold text-destructive">-{formatBRL(summary.custo_pecas)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5 bg-surface-3 p-2 rounded">
                <span className="font-bold">Margem de Contribuição</span>
                <span className="font-bold text-emerald-500">{formatBRL(summary.receita_total - summary.custo_pecas)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {transacoes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <EmptyState 
            icon={BarChart2}
            title="Nenhuma transação encontrada"
            description="Nenhuma OS foi concluída ou transacionada neste período."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] group hover:border-white/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    summary.variacao_percentual >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                  )}>
                    {summary.variacao_percentual >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                  </div>
                  <Badge variant={summary.variacao_percentual >= 0 ? 'success' : 'destructive'} className="scale-110 origin-top-right">
                    {summary.variacao_percentual > 0 ? '+' : ''}{summary.variacao_percentual}%
                  </Badge>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Receitas Totais</p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{formatBRL(summary.receita_total)}</h2>
              </CardContent>
            </Card>
            
            <Card className="border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] group hover:border-white/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-destructive/10 text-destructive">
                    <ArrowDownRight className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Custo Est. Peças</p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{formatBRL(summary.custo_pecas)}</h2>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] group hover:border-white/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Ticket Médio</p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{formatBRL(summary.ticket_medio)}</h2>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] group hover:border-white/20 transition-all duration-300">
              <CardContent className="p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Projeção 30d</p>
                  <h2 className="text-2xl font-bold tracking-tight text-blue-400">{formatBRL(projecaoReceita)}</h2>
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-2">*estimativa com base no ritmo atual</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-white/5 bg-surface-floating/30 gap-4">
                  <h3 className="text-lg font-bold tracking-tight px-1">Histórico de Transações</h3>
                  <div className="w-full sm:max-w-xs">
                    <Input 
                      icon={<Search className="w-4 h-4" />}
                      type="text" 
                      placeholder="Buscar por OS ou cliente..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="bg-surface-2 border-white/5 shadow-inner"
                    />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((os, i) => {
                        const valorTotal = (os.valor_mao_obra || 0) + (os.valor_pecas || 0);
                        return (
                          <TableRow key={i} className="cursor-pointer group">
                            <TableCell className="text-muted-foreground font-medium">
                              {new Date(os.atualizado_em).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">
                              OS #{os.numero_os} - {os.customer_nome}
                            </TableCell>
                            <TableCell>
                              <Badge variant="success">
                                Serviço
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold text-emerald-500">
                              + {formatBRL(valorTotal)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {filteredOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-3 w-full h-full">
                              <FileText className="w-10 h-10 opacity-20" />
                              <span className="font-medium">Nenhuma transação encontrada para sua busca.</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-6 tracking-tight">Receita por Categoria</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => formatBRL(Number(value) || 0)}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  {chartData.map((entry, index) => (
                    <div key={entry.name} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="font-bold">{formatBRL(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      <Toast 
        visible={toastConfig.visible} 
        message={toastConfig.message} 
        type={toastConfig.type} 
        onClose={() => setToastConfig({ ...toastConfig, visible: false })} 
      />
    </DashboardLayout>
  );
};

export default FinancialPage;
