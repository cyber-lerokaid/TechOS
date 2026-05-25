export const mapCustomerFromDB = (dbRow: any) => ({
  id: dbRow.id,
  nome: dbRow.nome,
  telefone: dbRow.telefone,
  email: dbRow.email,
  totalGasto: Number(dbRow.total_gasto || 0),
  totalOs: Number(dbRow.total_os || 0),
  criadoEm: dbRow.criado_em,
});

export const mapCustomerToDB = (appModel: any, tenantId: string) => ({
  tenant_id: tenantId,
  nome: appModel.nome,
  telefone: appModel.telefone,
  email: appModel.email,
});
