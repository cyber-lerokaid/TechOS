import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Search, Plus, AlertTriangle, Package, TrendingUp, X } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { MOCK_PRODUCTS, formatBRL } from '@/data/mock-data';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Card, CardContent } from '@/shared/ui/Card';
import { cn } from '@/shared/utils/cn';

const InventoryPage = () => {
  const { isDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'estoque' | 'vitrine'>('estoque');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  const [localProducts] = useState(isDemoMode ? MOCK_PRODUCTS : []);

  const categories = ['todos', 'notebook', 'celular', 'desktop', 'acessorio', 'outro'];

  const filteredProducts = localProducts.filter(p => {
    const matchSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'todos' || p.categoria === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setIsNewProductModalOpen(false);
  };

  const getMargin = (custo: number, venda: number) => {
    if (venda === 0) return 0;
    return (((venda - custo) / venda) * 100).toFixed(1);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Estoque & Vitrine</h1>
          <p className="text-muted-foreground mt-1">Gerencie peças e produtos à venda</p>
        </div>
        <Button variant="premium" onClick={() => setIsNewProductModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Novo Produto
        </Button>
      </div>

      <div className="flex gap-2 border-b border-border/50 mb-6 w-full">
        <button 
          className={cn(
            "pb-3 px-4 text-sm font-semibold transition-colors border-b-2",
            activeTab === 'estoque' 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab('estoque')}
        >
          Controle de Estoque
        </button>
        <button 
          className={cn(
            "pb-3 px-4 text-sm font-semibold transition-colors border-b-2",
            activeTab === 'vitrine' 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab('vitrine')}
        >
          Visão da Vitrine
        </button>
      </div>

      {localProducts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <EmptyState 
            icon={Package}
            title="Estoque vazio"
            description="Você ainda não possui peças ou produtos cadastrados no sistema."
            action={
              <Button onClick={() => setIsNewProductModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar Produto
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full">
            <div className="w-full md:max-w-xs">
              <Input 
                icon={<Search className="w-4 h-4" />}
                type="text" 
                placeholder="Buscar por nome ou SKU..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-card/50 glass border-border/50"
              />
            </div>
            <div className="flex gap-2 items-center overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all border",
                    categoryFilter === cat 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-card/50 glass text-muted-foreground hover:text-foreground border-border/50 hover:border-border"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'estoque' && (
            <Card className="border-border/50 bg-card/50 glass overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Produto / Peça</th>
                      <th className="px-6 py-4 font-semibold">SKU</th>
                      <th className="px-6 py-4 font-semibold">Qtd</th>
                      <th className="px-6 py-4 font-semibold">Custo</th>
                      <th className="px-6 py-4 font-semibold">Venda</th>
                      <th className="px-6 py-4 font-semibold">Margem</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredProducts.map(p => {
                      const margin = getMargin(p.preco_custo, p.preco_venda);
                      const isLow = p.quantidade_estoque <= 3 || p.estoque_critico;
                      return (
                        <tr key={p.id} className="hover:bg-accent/50 transition-colors group">
                          <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Package className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            {p.nome}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{p.sku}</td>
                          <td className="px-6 py-4">
                            <div className={cn(
                              "flex items-center gap-1.5 font-bold",
                              isLow ? "text-destructive" : "text-foreground"
                            )}>
                              {p.quantidade_estoque}
                              {isLow && <AlertTriangle className="w-4 h-4" />}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">{formatBRL(p.preco_custo)}</td>
                          <td className="px-6 py-4 font-bold text-foreground">{formatBRL(p.preco_venda)}</td>
                          <td className="px-6 py-4">
                            <Badge variant="success" className="bg-emerald-500/15 text-emerald-500 border-transparent">
                              <TrendingUp className="w-3 h-3 mr-1" /> {margin}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            {p.ativo ? (
                              <Badge variant="success" className="bg-primary/15 text-primary border-transparent">Ativo</Badge>
                            ) : (
                              <Badge variant="outline">Inativo</Badge>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-medium">Nenhum produto encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'vitrine' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(p => (
                <Card key={p.id} className="overflow-hidden group hover:border-primary/50 transition-all hover:shadow-lg bg-card/50 glass border-border/50">
                  <div className="h-40 bg-muted/30 flex items-center justify-center relative overflow-hidden">
                    {p.desconto_vitrine && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                        -{p.desconto_vitrine}%
                      </div>
                    )}
                    <Package className="w-16 h-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <CardContent className="p-5 flex flex-col h-[140px] justify-between">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight">{p.nome}</h3>
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex flex-col">
                        {p.desconto_vitrine && (
                          <span className="text-xs text-muted-foreground line-through font-medium">
                            {formatBRL(p.preco_venda)}
                          </span>
                        )}
                        <span className="text-lg font-bold text-primary tracking-tight">
                          {formatBRL(p.preco_venda * (1 - (p.desconto_vitrine || 0) / 100))}
                        </span>
                      </div>
                      <Badge variant={p.quantidade_estoque > 0 ? "success" : "destructive"} className="scale-90">
                        {p.quantidade_estoque > 0 ? 'Em estoque' : 'Esgotado'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Product Modal */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 shadow-2xl rounded-2xl w-full max-w-[500px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
              <h2 className="text-xl font-bold tracking-tight">Novo Produto / Peça</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsNewProductModalOpen(false)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleCreateProduct} className="p-6 flex flex-col gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Nome do Produto</label>
                <Input type="text" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">SKU / Código</label>
                  <Input type="text" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Qtd Estoque</label>
                  <Input type="number" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Preço Custo</label>
                  <Input type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Preço Venda</label>
                  <Input type="number" step="0.01" required />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsNewProductModalOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="default">Salvar Produto</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InventoryPage;
