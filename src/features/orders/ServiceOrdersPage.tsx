import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { STATUS_CONFIG, formatBRL } from '@/data/mock-data';
import { Search, Plus, Filter, FileText } from 'lucide-react';
import { Avatar } from '@/shared/ui/Avatar';
import { formatTimeAgo } from '@/shared/utils';
import { useAuth } from '@/app/providers/AuthContext';
import { OsDrawer } from '@/features/dashboard/OsDrawer';
import { fetchOrdensServico } from '@/shared/services/osService';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';

const ServiceOrdersPage = () => {
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOsId, setSelectedOsId] = useState<string | null>(null);
  const [baseOrders, setBaseOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const data = await fetchOrdensServico(isDemoMode);
        setBaseOrders(data || []);
      } catch (error) {
        console.error("Erro ao buscar ordens de serviço:", error);
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

  const filteredOrders = baseOrders.filter(os => 
    os.numero_os.includes(searchTerm) || 
    os.customer_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    os.device_label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Ordens de Serviço</h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as OS da sua assistência de forma ágil.</p>
        </div>
        <Button variant="premium" onClick={() => navigate('/checkin')}>
          <Plus className="w-5 h-5 mr-2" /> Nova OS
        </Button>
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
            <Button variant="secondary" className="shrink-0">
              <Filter className="w-4 h-4 mr-2" /> Filtros
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 bg-surface-2/90 backdrop-blur-md z-10">
                <tr className="border-b border-white/5 text-muted-foreground/70 text-[10px] uppercase tracking-[0.15em] font-semibold">
                  <th className="px-6 py-4">OS</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Aparelho</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Técnico</th>
                  <th className="px-6 py-4">Atualização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-6 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-0 py-0">
                      <EmptyState 
                        icon={FileText} 
                        title="Nenhuma OS encontrada" 
                        description="Você ainda não tem ordens de serviço ou nenhuma corresponde à sua busca."
                        actionLabel={searchTerm ? "Limpar busca" : "Criar Nova OS"}
                        onAction={() => searchTerm ? setSearchTerm('') : navigate('/checkin')}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(os => {
                    const statusColor = STATUS_CONFIG[os.status as keyof typeof STATUS_CONFIG]?.cor || 'var(--primary)';
                    return (
                      <tr 
                        key={os.id} 
                        className="hover:bg-white/[0.02] cursor-pointer transition-colors duration-300 ease-out group"
                        onClick={() => setSelectedOsId(os.id)}
                      >
                        <td className="px-6 py-4 font-semibold-plus text-muted-foreground group-hover:text-white transition-colors duration-300">
                          #{os.numero_os}
                        </td>
                        <td className="px-6 py-4 font-semibold-plus text-foreground">
                          {os.customer_nome}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {os.device_label}
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {os.valor_mao_obra || os.valor_pecas ? formatBRL((os.valor_mao_obra || 0) + (os.valor_pecas || 0)) : '-'}
                        </td>
                        <td className="px-6 py-4">
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
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar name={os.technician_nome} className="w-6 h-6 text-[10px]" />
                            <span className="text-muted-foreground text-xs font-medium">{os.technician_nome.split(' ')[0]}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {formatTimeAgo(os.atualizado_em)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
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
