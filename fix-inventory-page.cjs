const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/InventoryPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Imports
content = content.replace(
  "import { useAuth } from '@/app/providers/AuthContext';",
  "import { useInventoryList } from '@/shared/lib/hooks/inventory/useInventoryList';"
);
content = content.replace("import { MOCK_PRODUCTS, formatBRL } from '@/data/mock-data';", "import { formatBRL } from '@/data/mock-data';");

// 2. State
content = content.replace(
  "const { isDemoMode } = useAuth();",
  ""
);
content = content.replace(
  "const [localProducts, setLocalProducts] = useState(isDemoMode ? MOCK_PRODUCTS : []);",
  "const { data: remoteProducts, isLoading } = useInventoryList();\n  const localProducts = remoteProducts || [];"
);

// 3. Properties mapping
content = content.replace(/p\.quantidade_estoque/g, 'p.quantidadeEstoque');
content = content.replace(/p\.preco_custo/g, 'p.precoCusto');
content = content.replace(/p\.preco_venda/g, 'p.precoVenda');
content = content.replace(/p\.estoque_critico/g, 'p.estoqueCritico');
content = content.replace(/p\.estoque_minimo/g, 'p.estoqueMinimo');
content = content.replace(/p\.desconto_vitrine/g, 'p.descontoVitrine');

// 4. remove local setLocalProducts from handleBaixa
content = content.replace(
  /setLocalProducts\(prev => prev.map\(p => {[\s\S]*?}\)\);/g,
  "// Not updating local state manually. Rely on mutation."
);


fs.writeFileSync(filePath, content);
console.log('InventoryPage updated!');
