const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walk(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walk(path.join(__dirname, 'src'), (filePath) => {
  if ((filePath.endsWith('.tsx') || filePath.endsWith('.ts')) && !filePath.includes('order.mapper.ts') && !filePath.includes('mock-data.ts') && !filePath.includes('demo-generator.ts') && !filePath.includes('order.demo.ts') && !filePath.includes('CheckinWizard.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    const replaces = [
      { from: /\.numero_os/g, to: '.numeroOs' },
      { from: /\.device_label/g, to: '.deviceLabel' },
      { from: /\.problema_relatado/g, to: '.problemaRelatado' },
      { from: /\.technician_nome/g, to: '.technicianNome' },
      { from: /\.technician_id/g, to: '.technicianId' },
      { from: /\.valor_mao_obra/g, to: '.valorMaoObra' },
      { from: /\.valor_pecas/g, to: '.valorPecas' },
      { from: /\.criado_em/g, to: '.criadoEm' },
      { from: /\.atualizado_em/g, to: '.atualizadoEm' },
      { from: /\.device_tipo/g, to: '.deviceTipo' },
      { from: /\.horas_abertas/g, to: '.horasAbertas' },
      { from: /\.garantia_dias/g, to: '.garantiaDias' },
      { from: /\.fotos_checkin/g, to: '.fotosCheckin' },
      { from: /\.checklist_itens/g, to: '.checklistItens' },
      { from: /\.assinatura_url/g, to: '.assinaturaUrl' },
      { from: /\.os_id/g, to: '.osId' },
      { from: /\.status_novo/g, to: '.statusNovo' },
      { from: /\.changed_by_nome/g, to: '.changedByNome' },
      { from: /\.nota_publica/g, to: '.notaPublica' },
      { from: /\.status_anterior/g, to: '.statusAnterior' },
      { from: /\.nota_interna/g, to: '.notaInterna' },
    ];
    
    replaces.forEach(r => {
      if (r.from.test(content)) {
        content = content.replace(r.from, r.to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed', filePath);
    }
  }
});
