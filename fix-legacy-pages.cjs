const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/FinancialPage.tsx',
  'src/pages/HistoricoPage.tsx',
  'src/lib/financialCalc.ts'
];

files.forEach(f => {
  const fullPath = path.join(__dirname, f);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace snake_case fields mapped in mapOrderFromDB
    content = content.replace(/\.numero_os/g, '.numeroOs');
    content = content.replace(/\.device_label/g, '.deviceLabel');
    content = content.replace(/\.problema_relatado/g, '.problemaRelatado');
    content = content.replace(/\.technician_nome/g, '.technicianNome');
    content = content.replace(/\.technician_id/g, '.technicianId');
    content = content.replace(/\.valor_mao_obra/g, '.valorMaoObra');
    content = content.replace(/\.valor_pecas/g, '.valorPecas');
    content = content.replace(/\.criado_em/g, '.criadoEm');
    content = content.replace(/\.atualizado_em/g, '.atualizadoEm');
    
    fs.writeFileSync(fullPath, content);
    console.log('Fixed', f);
  }
});
