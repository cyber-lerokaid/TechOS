export const mapInventoryFromDB = (dbRow: any) => ({
  id: dbRow.id,
  nome: dbRow.nome,
  sku: dbRow.sku,
  quantidadeEstoque: Number(dbRow.quantidade_estoque || 0),
  precoCusto: Number(dbRow.preco_custo || 0),
  precoVenda: Number(dbRow.preco_venda || 0),
  criadoEm: dbRow.criado_em,
  categoria: 'outro',
  estoqueCritico: Number(dbRow.quantidade_estoque || 0) <= 3,
  estoqueMinimo: 3,
  descontoVitrine: 0,
  ativo: true,
});

export const mapInventoryToDB = (appModel: any, tenantId: string) => ({
  tenant_id: tenantId,
  nome: appModel.nome,
  sku: appModel.sku,
  quantidade_estoque: appModel.quantidadeEstoque,
  preco_custo: appModel.precoCusto,
  preco_venda: appModel.precoVenda,
});
