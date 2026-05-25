const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, 'src/data/mock-data.ts');
let mockData = fs.readFileSync(mockDataPath, 'utf8');

// Remove from ServiceOrder interface
mockData = mockData.replace(/  customer_nome: string;\n/g, '');
mockData = mockData.replace(/  customer_telefone: string;\n/g, '');

// Remove from MOCK_SERVICE_ORDERS array objects
mockData = mockData.replace(/\s*customer_nome: ".*?",/g, '');
mockData = mockData.replace(/\s*customer_telefone: ".*?",/g, '');

fs.writeFileSync(mockDataPath, mockData);

const demoStorePath = path.join(__dirname, 'src/shared/lib/api/providers/demo/demo-store.ts');
let demoStore = fs.readFileSync(demoStorePath, 'utf8');
// remove the remapping in demo-store if it exists, wait, demo-store currently is just `[...MOCK_SERVICE_ORDERS]` so nothing to remove!

console.log('mock-data.ts updated!');
