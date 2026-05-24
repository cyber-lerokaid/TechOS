const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  { regex: /['"](\.\.\/)+contexts\/AuthContext['"]/g, replace: "'@/app/providers/AuthContext'" },
  { regex: /['"]\.\/contexts\/AuthContext['"]/g, replace: "'@/app/providers/AuthContext'" },
  
  { regex: /['"](\.\.\/)+components\/ui\/([a-zA-Z0-9_]+)['"]/g, replace: "'@/shared/ui/$2'" },
  { regex: /['"]\.\.\/ui\/([a-zA-Z0-9_]+)['"]/g, replace: "'@/shared/ui/$1'" },
  { regex: /['"](\.\.\/)+components\/auth\/([a-zA-Z0-9_]+)['"]/g, replace: "'@/features/auth/$2'" },
  
  { regex: /['"](\.\.\/)+services\/([a-zA-Z0-9_]+)['"]/g, replace: "'@/shared/services/$2'" },
  
  { regex: /['"](\.\.\/)+utils\/financialCalc['"]/g, replace: "'@/shared/utils/financialCalc'" },
  { regex: /['"](\.\.\/)+utils['"]/g, replace: "'@/shared/utils'" },
  
  { regex: /['"](\.\.\/)+components\/DashboardLayout['"]/g, replace: "'@/layouts/DashboardLayout'" },
  
  { regex: /['"](\.\.\/)+components\/dashboard\/([a-zA-Z0-9_]+)['"]/g, replace: "'@/features/dashboard/$2'" },
  { regex: /['"]\.\/dashboard\/([a-zA-Z0-9_]+)['"]/g, replace: "'@/features/dashboard/$1'" },
  
  { regex: /['"](\.\.\/)+components\/public\/([a-zA-Z0-9_]+)['"]/g, replace: "'@/features/public/$2'" },
  
  { regex: /['"](\.\.\/)+data\/([a-zA-Z0-9_-]+)['"]/g, replace: "'@/data/$2'" },
  
  { regex: /['"]\.\/App\.tsx['"]/g, replace: "'@/app/routes/App.tsx'" },
  { regex: /['"](\.\.\/)+lib\/supabase['"]/g, replace: "'@/shared/lib/supabase'" },
  { regex: /['"]\.\/components\/auth\/ProtectedRoute['"]/g, replace: "'@/features/auth/ProtectedRoute'" },
  { regex: /['"]\.\/pages\/Dashboard['"]/g, replace: "'@/features/dashboard/Dashboard'" },
  { regex: /['"]\.\/pages\/PublicOSLink['"]/g, replace: "'@/features/public/PublicOSLink'" },
  { regex: /['"]\.\/pages\/CheckinWizard['"]/g, replace: "'@/features/checkin/CheckinWizard'" },
  { regex: /['"]\.\/pages\/LandingPage['"]/g, replace: "'@/features/public/LandingPage'" },
  { regex: /['"]\.\/pages\/LoginPage['"]/g, replace: "'@/features/auth/LoginPage'" },
  { regex: /['"]\.\/pages\/RegisterPage['"]/g, replace: "'@/features/auth/RegisterPage'" },
  { regex: /['"]\.\/pages\/ServiceOrdersPage['"]/g, replace: "'@/features/orders/ServiceOrdersPage'" },
  { regex: /['"]\.\/pages\/CustomersPage['"]/g, replace: "'@/features/customers/CustomersPage'" },
  { regex: /['"]\.\/pages\/InventoryPage['"]/g, replace: "'@/features/inventory/InventoryPage'" },
  { regex: /['"]\.\/pages\/FinancialPage['"]/g, replace: "'@/features/financial/FinancialPage'" },
  { regex: /['"]\.\/pages\/SettingsPage['"]/g, replace: "'@/features/settings/SettingsPage'" }
];

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(({ regex, replace }) => {
      content = content.replace(regex, replace);
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed imports in', filePath);
    }
  }
});
