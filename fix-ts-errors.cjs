const fs = require('fs');
const path = require('path');

function replaceFile(file, replaces) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  replaces.forEach(r => content = content.replace(r[0], r[1]));
  fs.writeFileSync(p, content);
}

// 1. Fix types imports
replaceFile('src/shared/lib/api/provider-factory.ts', [[ "import { IDataProvider", "import type { IDataProvider" ]]);
replaceFile('src/shared/lib/api/providers/demo/index.ts', [[ "import { IDataProvider", "import type { IDataProvider" ]]);
replaceFile('src/shared/lib/api/providers/demo/customer.demo.ts', [[ "import { ICustomerApi", "import type { ICustomerApi" ]]);
replaceFile('src/shared/lib/api/providers/demo/order.demo.ts', [[ "import { IOrderApi", "import type { IOrderApi" ]]);
replaceFile('src/shared/lib/api/providers/demo/inventory.demo.ts', [[ "import { IInventoryApi", "import type { IInventoryApi" ]]);
replaceFile('src/shared/lib/api/providers/supabase/index.ts', [[ "import { IDataProvider", "import type { IDataProvider" ]]);
replaceFile('src/shared/lib/api/providers/supabase/customer.supabase.ts', [[ "import { ICustomerApi", "import type { ICustomerApi" ]]);
replaceFile('src/shared/lib/api/providers/supabase/order.supabase.ts', [[ "import { IOrderApi", "import type { IOrderApi" ]]);
replaceFile('src/shared/lib/api/providers/supabase/inventory.supabase.ts', [[ "import { IInventoryApi", "import type { IInventoryApi" ]]);

// 2. Fix demo-store.ts mapping errors
const demoStore = `
import { MOCK_CUSTOMERS, MOCK_SERVICE_ORDERS, MOCK_PRODUCTS } from '@/data/mock-data';

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class DemoStore {
  public customers = [...MOCK_CUSTOMERS];
  public orders = [...MOCK_SERVICE_ORDERS];
  public inventory = [...MOCK_PRODUCTS];
}

export const demoStore = new DemoStore();
`;
fs.writeFileSync(path.join(__dirname, 'src/shared/lib/api/providers/demo/demo-store.ts'), demoStore.trim() + '\\n');

console.log('Fixed TS errors');
