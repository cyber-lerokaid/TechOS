import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search, Plus, Package, Download, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useInventoryList } from '@/shared/lib/hooks/inventory/useInventoryList';
import { inventoryApi } from '@/shared/lib/api/inventory.api';
import { formatBRL } from '@/data/mock-data';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/cn';

const InventoryPage = () => {
  
  type Tab = 'estoque' | 'vitrine' | 'movimentacoes';
  const [activeTab, setActiveTab] = useState<Tab>('estoque');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  const queryClient = useQueryClient();
  const { data: remoteProducts } = useInventoryList();
  const localProducts = remoteProducts || [];
  const [isBaixaModalOpen, setIsBaixaModalOpen] = useState(false);
  const [isEntradaModalOpen, setIsEntradaModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [baixaQtd, setBaixaQtd] = useState(1);
  const [baixaMotivo, setBaixaMotivo] = useState('Venda PDV');
  const [entradaQtd, setEntradaQtd] = useState(1);
  const [entradaMotivo, setEntradaMotivo] = useState('Reposição de Fornecedor');

  const [movimentacoes, setMovimentacoes] = useState([
    { id: 'm1', tipo: 'saida', produto: 'SSD 480GB Kingston A400', quantidade: 1, motivo: 'OS #0047', data: new Date(Date.now() - 2*3600000).toISOString() },
    { id: 'm2', tipo: 'saida', produto: 'Película 3D iPhone 13', quantidade: 2, motivo: 'Venda PDV', data: new Date(Date.now() - 5*3600000).toISOString() },
    { id: 'm3', tipo: 'entrada', produto: 'Cabo USB-C Lightning', quantidade: 10, motivo: 'Reposição manual', data: new Date(Date.now() - 24*3600000).toISOString() },
    { id: 'm4', tipo: 'saida', produto: 'Carregador Turbo 65W', quantidade: 1, motivo: 'OS #0048', data: new Date(Date.now() - 48*3600000).toISOString() },
  ]);

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

  const handleBaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      const newQty = Math.max(0, selectedProduct.quantidadeEstoque - baixaQtd);
      await inventoryApi.updateInventoryItem(selectedProduct.id, { quantidadeEstoque: newQty });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      setMovimentacoes(prev => [
        {
          id: `m_new_${Date.now()}`,
          tipo: 'saida',
          produto: selectedProduct.nome,
          quantidade: baixaQtd,
          motivo: baixaMotivo,
          data: new Date().toISOString()
        },
        ...prev
      ]);

      setIsBaixaModalOpen(false);
      setSelectedProduct(null);
      setBaixaQtd(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      const newQty = selectedProduct.quantidadeEstoque + entradaQtd;
      await inventoryApi.updateInventoryItem(selectedProduct.id, { quantidadeEstoque: newQty });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });

      setMovimentacoes(prev => [
        {
          id: `m_new_ent_${Date.now()}`,
          tipo: 'entrada',
          produto: selectedProduct.nome,
          quantidade: entradaQtd,
          motivo: entradaMotivo,
          data: new Date().toISOString()
        },
        ...prev
      ]);

      setIsEntradaModalOpen(false);
      setSelectedProduct(null);
      setEntradaQtd(1);
    } catch (err) {
      console.error(err);
    }
  };

  const getGiro = (produto: any): { label: string; color: string } => {
    const margin = Number(getMargin(produto.precoCusto, produto.precoVenda));
    const stock = produto.quantidadeEstoque;
    if (stock <= 3 && margin > 30) return { label: 'Alto', color: 'rgba(34,197,94,0.85)' };
    if (stock > 15) return { label: 'Baixo', color: 'rgba(239,68,68,0.85)' };
    return { label: 'Médio', color: 'rgba(245,158,11,0.85)' };
  };

  const exportCSV = () => {
    const headers = ['Nome', 'SKU', 'Categoria', 'Estoque', 'Custo', 'Venda', 'Margem%'];
    const rows = localProducts.map(p => [
      p.nome, p.sku, p.categoria, p.quantidadeEstoque,
      p.precoCusto, p.precoVenda, getMargin(p.precoCusto, p.precoVenda)
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'estoque.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const totalEstoque = filteredProducts.reduce((acc, p) => acc + (p.precoCusto * p.quantidadeEstoque), 0);
  const totalVenda = filteredProducts.reduce((acc, p) => acc + (p.precoVenda * p.quantidadeEstoque), 0);
  const itensCriticos = filteredProducts.filter(p => p.estoqueCritico || p.quantidadeEstoque <= (p.estoqueMinimo || 3)).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Estoque & Vitrine</h1>
          <p className="text-muted-foreground mt-1">Gerencie peças e produtos à venda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
          <Button variant="default" onClick={() => setIsNewProductModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" /> Novo Produto
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/5 mb-6 w-full">
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
        <button 
          className={cn(
            "pb-3 px-4 text-sm font-semibold transition-colors border-b-2",
            activeTab === 'movimentacoes' 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab('movimentacoes')}
        >
          Movimentações
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Valor em Estoque (Custo)', value: formatBRL(totalEstoque), color: 'rgba(37,99,235,0.8)' },
          { label: 'Valor em Estoque (Venda)', value: formatBRL(totalVenda), color: 'rgba(34,197,94,0.8)' },
          { label: 'Itens em Alerta', value: `${itensCriticos} produto${itensCriticos !== 1 ? 's' : ''}`, color: 'rgba(245,158,11,0.8)' },
        ].map(card => (
          <div key={card.label} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {card.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: card.color, letterSpacing: '-0.02em' }}>
              {card.value}
            </div>
          </div>
        ))}
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
                className="bg-surface-2 border-white/5"
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
                      : "bg-surface-2/80 backdrop-blur-md text-muted-foreground hover:text-foreground border-white/5 hover:border-white/20"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'estoque' && (
            <Card className="border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto / Peça</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Custo</TableHead>
                      <TableHead>Venda</TableHead>
                      <TableHead>Margem</TableHead>
                      <TableHead>Giro</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map(p => {
                      const margin = getMargin(p.precoCusto, p.precoVenda);
                      return (
                        <TableRow key={p.id} className="cursor-pointer group">
                          <TableCell className="font-semibold text-foreground flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Package className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            {p.nome}
                          </TableCell>
                          <TableCell className="font-mono">{p.sku}</TableCell>
                          <TableCell>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{
                                fontSize: 13, fontWeight: 600,
                                color: p.estoqueCritico ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.75)',
                              }}>
                                {p.quantidadeEstoque}
                              </span>
                              {p.estoqueCritico && (
                                <span style={{
                                  fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                                  background: 'rgba(239,68,68,0.12)', color: 'rgba(239,68,68,0.8)',
                                  textTransform: 'uppercase', letterSpacing: '0.06em',
                                }}>
                                  BAIXO
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatBRL(p.precoCusto)}</TableCell>
                          <TableCell className="font-bold">{formatBRL(p.precoVenda)}</TableCell>
                          <TableCell>
                            <span style={{
                              fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                              background: Number(margin) > 40
                                ? 'rgba(34,197,94,0.12)'
                                : Number(margin) > 20
                                  ? 'rgba(245,158,11,0.12)'
                                  : 'rgba(239,68,68,0.12)',
                              color: Number(margin) > 40
                                ? 'rgba(34,197,94,0.9)'
                                : Number(margin) > 20
                                  ? 'rgba(245,158,11,0.9)'
                                  : 'rgba(239,68,68,0.9)',
                            }}>
                              {margin}%
                            </span>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const giro = getGiro(p);
                              return (
                                <span style={{
                                  fontSize: 12, fontWeight: 700, color: giro.color,
                                }}>
                                  {giro.label}
                                </span>
                              )
                            })()}
                          </TableCell>
                          <TableCell>
                            {p.ativo ? (
                              <Badge variant="success">Ativo</Badge>
                            ) : (
                              <Badge variant="outline">Inativo</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-xs border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(p);
                                  setIsEntradaModalOpen(true);
                                }}
                                title="Entrada de Estoque"
                              >
                                <ArrowUpCircle className="w-3.5 h-3.5" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-xs border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(p);
                                  setIsBaixaModalOpen(true);
                                }}
                                title="Baixa de Estoque"
                              >
                                <ArrowDownCircle className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {filteredProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground font-medium">Nenhum produto encontrado.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {activeTab === 'vitrine' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(p => (
                <Card key={p.id} className="overflow-hidden group hover:border-white/20 transition-all hover:shadow-lg bg-surface-2/80 backdrop-blur-xl border-white/5">
                  <div className="h-40 bg-muted/30 flex items-center justify-center relative overflow-hidden">
                    {p.descontoVitrine && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                        -{p.descontoVitrine}%
                      </div>
                    )}
                    <Package className="w-16 h-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <CardContent className="p-5 flex flex-col h-[140px] justify-between">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight">{p.nome}</h3>
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex flex-col">
                        {p.descontoVitrine && (
                          <span className="text-xs text-muted-foreground line-through font-medium">
                            {formatBRL(p.precoVenda)}
                          </span>
                        )}
                        <span className="text-lg font-bold text-primary tracking-tight">
                          {formatBRL(p.precoVenda * (1 - (p.descontoVitrine || 0) / 100))}
                        </span>
                      </div>
                      <Badge variant={p.quantidadeEstoque > 0 ? "success" : "destructive"} className="scale-90">
                        {p.quantidadeEstoque > 0 ? 'Em estoque' : 'Esgotado'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'movimentacoes' && (
            <Card className="border-white/5 bg-surface-2/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoes.map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(m.data).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={m.tipo === 'entrada' ? 'success' : 'destructive'} className="uppercase text-[10px]">
                            {m.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {m.produto}
                        </TableCell>
                        <TableCell className="font-mono">
                          {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {m.motivo}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      )}

      <Modal 
        isOpen={isNewProductModalOpen} 
        onClose={() => setIsNewProductModalOpen(false)}
        title="Novo Produto / Peça"
      >
        <form onSubmit={handleCreateProduct} className="flex flex-col gap-5">
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Estoque Mínimo</label>
              <Input type="number" defaultValue={3} required />
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
      </Modal>

      <Modal 
        isOpen={isBaixaModalOpen} 
        onClose={() => setIsBaixaModalOpen(false)}
        title={`Dar Baixa: ${selectedProduct?.nome}`}
      >
        <form onSubmit={handleBaixa} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Quantidade a dar baixa</label>
            <Input 
              type="number" 
              min={1} 
              max={selectedProduct?.quantidadeEstoque || 1}
              value={baixaQtd}
              onChange={e => setBaixaQtd(Number(e.target.value))}
              required 
            />
            <p className="text-xs text-muted-foreground">Em estoque: <span className="font-bold text-foreground">{selectedProduct?.quantidadeEstoque}</span></p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Motivo da Baixa</label>
            <select 
              value={baixaMotivo}
              onChange={e => setBaixaMotivo(e.target.value)}
              className="w-full bg-surface-2 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="Venda PDV">Venda (PDV/Balcão)</option>
              <option value="Uso em OS">Uso em Ordem de Serviço</option>
              <option value="Perda/Dano">Perda ou Dano</option>
              <option value="Devolução">Devolução a Fornecedor</option>
              <option value="Outro">Outro Motivo</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsBaixaModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="destructive">Confirmar Baixa</Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isEntradaModalOpen} 
        onClose={() => setIsEntradaModalOpen(false)}
        title={`Entrada: ${selectedProduct?.nome}`}
      >
        <form onSubmit={handleEntrada} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Quantidade a adicionar</label>
            <Input 
              type="number" 
              min={1} 
              value={entradaQtd}
              onChange={e => setEntradaQtd(Number(e.target.value))}
              required 
            />
            <p className="text-xs text-muted-foreground">Estoque atual: <span className="font-bold text-foreground">{selectedProduct?.quantidadeEstoque}</span></p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Motivo / Origem</label>
            <select 
              value={entradaMotivo}
              onChange={e => setEntradaMotivo(e.target.value)}
              className="w-full bg-surface-2 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="Reposição de Fornecedor">Reposição de Fornecedor</option>
              <option value="Devolução de Cliente">Devolução de Cliente</option>
              <option value="Ajuste de Inventário">Ajuste de Inventário</option>
              <option value="Outro">Outro Motivo</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsEntradaModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Confirmar Entrada</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default InventoryPage;
