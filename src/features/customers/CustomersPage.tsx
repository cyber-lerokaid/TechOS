import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Users, Plus, Search, Phone, Mail, X, History } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { MOCK_CUSTOMERS, MOCK_SERVICE_ORDERS } from '@/data/mock-data';
import { fetchDemoCustomers } from '@/shared/services/osService';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { formatTimeAgo } from '@/shared/utils';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Card, CardContent } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';

const CustomersPage = () => {
  const { isDemoMode } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [localCustomers, setLocalCustomers] = useState<any[]>([]);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  useEffect(() => {
    setIsLoading(true);
    // Simulate network delay for premium perception of loading
    const timer = setTimeout(() => {
      setLocalCustomers(isDemoMode ? MOCK_CUSTOMERS : []);
      setIsLoading(false);
    }, 600);

    const handleDemoGenerated = () => {
      if (isDemoMode) {
        setIsLoading(true);
        setTimeout(() => {
          const updated = fetchDemoCustomers();
          setLocalCustomers(updated);
          setIsLoading(false);
        }, 600);
      }
    };
    window.addEventListener('demoDataGenerated', handleDemoGenerated);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('demoDataGenerated', handleDemoGenerated);
    };
  }, [isDemoMode]);

  const filteredCustomers = localCustomers.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.telefone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer = {
      id: `cust_local_${Date.now()}`,
      tenant_id: 'demo-tenant',
      nome: newCustomerName,
      telefone: newCustomerPhone,
      email: newCustomerEmail || null,
      total_gasto: 0,
      total_os: 0,
      criado_em: new Date().toISOString(),
    };
    setLocalCustomers(prev => [newCustomer, ...prev]);
    setNewCustomerName(''); 
    setNewCustomerPhone(''); 
    setNewCustomerEmail('');
    setIsNewCustomerModalOpen(false);
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message: 'Cliente cadastrado com sucesso!', type: 'success' } 
    }));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie a base de clientes da assistência</p>
        </div>
        <Button variant="premium" onClick={() => setIsNewCustomerModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Novo Cliente
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-card/50 glass border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </CardContent>
            </Card>
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
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="w-full max-w-md">
            <Input 
              icon={<Search className="w-4 h-4" />}
              type="text" 
              placeholder="Buscar por nome, telefone ou email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-card/50 glass border-border/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCustomers.map(customer => (
              <Card 
                key={customer.id} 
                className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-300 bg-card/50 glass border-border/50"
                onClick={() => setSelectedCustomer(customer)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar name={customer.nome} size={48} className="group-hover:scale-105 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{customer.nome}</h3>
                      <p className="text-xs text-muted-foreground">Cliente desde {new Date(customer.criado_em).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> 
                      <span className="truncate">{customer.telefone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> 
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Selected Customer Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-background/80 backdrop-blur-xl border-l border-border/50 z-[1000] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <h2 className="text-xl font-bold tracking-tight">Detalhes do Cliente</h2>
            <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col items-center text-center mb-8">
              <Avatar name={selectedCustomer.nome} size={80} className="mb-4 shadow-lg ring-4 ring-background" />
              <h3 className="text-2xl font-bold tracking-tight mb-1">{selectedCustomer.nome}</h3>
              {selectedCustomer.email && <p className="text-muted-foreground text-sm">{selectedCustomer.email}</p>}
              <p className="text-muted-foreground text-sm font-medium mt-1 bg-muted px-3 py-1 rounded-full">{selectedCustomer.telefone}</p>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Histórico de OS</h4>
            </div>
            
            <div className="flex flex-col gap-3">
              {isDemoMode ? MOCK_SERVICE_ORDERS.filter(os => os.customer_id === selectedCustomer.id).map(os => (
                <div key={os.id} className="p-4 bg-card/50 glass border border-border/50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-foreground">OS #{os.numero_os}</span>
                    <Badge variant={os.status === 'pronto' ? 'success' : 'info'} className="scale-90">
                      {os.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground mb-2">{os.device_label}</p>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    Atualizado {formatTimeAgo(os.atualizado_em)}
                  </p>
                </div>
              )) : (
                <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border/50">
                  <p className="text-muted-foreground text-sm">Nenhuma OS encontrada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 shadow-2xl rounded-2xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
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
                <Input type="tel" required value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">E-mail</label>
                <Input type="email" value={newCustomerEmail} onChange={e => setNewCustomerEmail(e.target.value)} />
              </div>
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
