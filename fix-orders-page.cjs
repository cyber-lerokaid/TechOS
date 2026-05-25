const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/ServiceOrdersPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Imports
content = content.replace(
  "import { fetchOrdensServico } from '@/lib/services/osService';",
  "import { useOrderList } from '@/shared/lib/hooks/orders/useOrderList';\nimport { useUpdateOrderStatus } from '@/shared/lib/hooks/orders/useUpdateOrderStatus';"
);

// 2. React Query Hooks & State
content = content.replace(
  /const \[baseOrders, setBaseOrders\] = useState<any\[\]>\(\[\]\);\s*const \[isLoading, setIsLoading\] = useState\(true\);/,
  `const { data: remoteOrders, isLoading: isOrdersLoading } = useOrderList();
  const updateStatusMutation = useUpdateOrderStatus();
  const baseOrders = remoteOrders || [];
  const isLoading = isOrdersLoading;`
);

// 3. handleMarkEntregue
content = content.replace(
  /const handleMarkEntregue = \(_osId: string\) => {[\s\S]*?};\s*const setOsForQuote/,
  `const handleMarkEntregue = async (osId: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: osId, status: 'entregue' });
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'OS marcada como Entregue', type: 'success' } }));
    } catch(err: any) {
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: err.message || 'Erro', type: 'error' } }));
    }
  };

  const setOsForQuote`
);

// 4. Delete the manual useEffect
content = content.replace(
  /useEffect\(\(\) => {\s*const loadOrders = async \(\) => {[\s\S]*?}, \[isDemoMode\]\);/,
  ''
);

// 5. Replace mapped properties
content = content.replace(/os\.numero_os/g, 'os.numeroOs');
content = content.replace(/os\.customer_nome/g, 'os.customerNome');
content = content.replace(/os\.device_label/g, 'os.deviceLabel');
content = content.replace(/os\.criado_em/g, 'os.criadoEm');
content = content.replace(/os\.atualizado_em/g, 'os.atualizadoEm');
content = content.replace(/os\.valor_mao_obra/g, 'os.valorMaoObra');
content = content.replace(/os\.valor_pecas/g, 'os.valorPecas');
content = content.replace(/os\.technician_nome/g, 'os.technicianNome');

// 6. Remove isDemoMode
content = content.replace('const { isDemoMode } = useAuth();', '');

fs.writeFileSync(filePath, content);
console.log('ServiceOrdersPage updated!');
