const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk(path.join(__dirname, 'src'), (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace property names avoiding definitions inside mock-data interface if they exist
    // But we already removed them from mock-data!
    if (content.includes('customer_nome') || content.includes('customer_telefone')) {
      content = content.replace(/customer_nome/g, 'customerNome');
      content = content.replace(/customer_telefone/g, 'customerTelefone');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log('Modified:', filePath);
    }
  }
});
