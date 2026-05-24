import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { EmptyState } from '@/shared/ui/EmptyState';
import { BarChart2, Download, DollarSign, ArrowUpRight, ArrowDownRight, Search, FileText } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { formatBRL, type ServiceOrder } from '@/data/mock-data';
import { Toast, type ToastType } from '@/shared/ui/Toast';
import { Badge } from '@/shared/ui/Badge';
import { calcularFinanceiro, getTransacoesPorPeriodo } from '@/shared/utils/financialCalc';
import { fetchOrdensServico } from '@/shared/services/osService';
import { Card, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/shared/utils/cn';

const FinancialPage = () => {
  const { isDemoMode } = useAuth();
  const [period, setPeriod] = useState('7d');
  const [toastConfig, setToastConfig] = useState<{ message: string, type: ToastType, visible: boolean }>({ message: '', type: 'info', visible: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<ServiceOrder[]>([]);

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

  const summary = calcularFinanceiro(orders, period);
  const transacoes = getTransacoesPorPeriodo(orders, period);

  const filteredOrders = transacoes.filter(os => 
    os.numero_os.includes(searchTerm) || 
    os.customer_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    setToastConfig({ message: 'Exportação estará disponível em breve!', type: 'info', visible: true });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Controle de caixa, receitas e despesas da sua assistência</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="bg-card/50 glass">
          <Download className="w-4 h-4 mr-2" /> Exportar Relatório
        </Button>
      </div>

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
          {/* Top Period Selector */}
          <div className="flex gap-2 items-center overflow-x-auto pb-2 hide-scrollbar">
            {['Hoje', '7d', '15d', '30d', 'Este Mês'].map(p => (
              <button 
                key={p} 
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                  period === p 
                    ? "bg-primary text-primary-foreground shadow-md border border-primary" 
                    : "bg-card/50 glass text-muted-foreground hover:text-foreground border border-border/50 hover:border-border"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card/50 glass border-border/50 group hover:shadow-lg transition-all duration-300">
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
            
            <Card className="bg-card/50 glass border-border/50 group hover:shadow-lg transition-all duration-300">
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

            <Card className="bg-card/50 glass border-border/50 group hover:shadow-lg transition-all duration-300">
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
          </div>

          {/* Transactions List */}
          <Card className="bg-card/50 glass border-border/50 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-border/50 gap-4">
              <h3 className="text-lg font-bold tracking-tight">Histórico de Transações</h3>
              <div className="w-full sm:max-w-xs">
                <Input 
                  icon={<Search className="w-4 h-4" />}
                  type="text" 
                  placeholder="Buscar por OS ou cliente..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider border-b border-border/50">
                    <th className="px-6 py-4 font-semibold">Data</th>
                    <th className="px-6 py-4 font-semibold">Descrição</th>
                    <th className="px-6 py-4 font-semibold">Categoria</th>
                    <th className="px-6 py-4 font-semibold text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredOrders.map((os, i) => {
                    const valorTotal = (os.valor_mao_obra || 0) + (os.valor_pecas || 0);
                    return (
                      <tr key={i} className="hover:bg-accent/50 transition-colors">
                        <td className="px-6 py-4 text-muted-foreground font-medium">
                          {new Date(os.atualizado_em).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          Fechamento OS #{os.numero_os} - {os.customer_nome}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="success" className="bg-emerald-500/15 text-emerald-500 border-transparent">
                            Serviço
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-500">
                          + {formatBRL(valorTotal)}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="w-10 h-10 opacity-20" />
                          <span className="font-medium">Nenhuma transação encontrada para sua busca.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
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
