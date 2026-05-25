const fs = require('fs');

const files = [
  'src/shared/lib/hooks/customers/useCustomerList.ts',
  'src/shared/lib/hooks/customers/useCreateCustomer.ts',
  'src/shared/lib/hooks/orders/useOrderList.ts',
  'src/shared/lib/hooks/orders/useUpdateOrderStatus.ts',
  'src/shared/lib/hooks/inventory/useInventoryList.ts'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/user\?\.user_metadata\?\.tenant_id/g, 'user?.user_metadata?.tenant_id || user?.tenant_id');
  fs.writeFileSync(f, c);
});
console.log('Fixed tenant_id extraction in hooks');
