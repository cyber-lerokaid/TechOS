const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'src');

const moves = [
  { from: 'shared/components', to: 'components/shared' },
  { from: 'shared/constants', to: 'lib/constants' },
  { from: 'shared/services', to: 'lib/services' },
  { from: 'shared/types', to: 'types' },
  { from: 'shared/lib', to: 'lib/shared' }, // some lib might exist inside shared
  { from: 'index.css', to: 'styles/index.css' }
];

function mkdirp(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function moveFileOrDir(fromPath, toPath) {
  const fullFrom = path.join(root, fromPath);
  const fullTo = path.join(root, toPath);
  
  if (!fs.existsSync(fullFrom)) return;
  
  const toDir = path.dirname(fullTo);
  mkdirp(toDir);
  
  try {
    fs.cpSync(fullFrom, fullTo, { recursive: true });
    fs.rmSync(fullFrom, { recursive: true, force: true });
    console.log(`Moved ${fromPath} to ${toPath}`);
  } catch (e) {
    console.error(`Failed to move ${fromPath} to ${toPath}`, e);
  }
}

// Perform moves
moves.forEach(m => moveFileOrDir(m.from, m.to));

// Find all TS/TSX files and update imports
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = getAllFiles(root);

const importReplacements = [
  { search: /@\/shared\/ui\//g, replace: '@/components/ui/' },
  { search: /@\/shared\/utils\//g, replace: '@/lib/' },
  { search: /@\/shared\/utils/g, replace: '@/lib' }, // For utils index
  { search: /@\/shared\/hooks\//g, replace: '@/hooks/' },
  { search: /@\/shared\/components\//g, replace: '@/components/shared/' },
  { search: /@\/shared\/constants\//g, replace: '@/lib/constants/' },
  { search: /@\/shared\/services\//g, replace: '@/lib/services/' },
  { search: /@\/shared\/types\//g, replace: '@/types/' },
  { search: /@\/shared\/lib\//g, replace: '@/lib/shared/' },
  { search: /'\.\/index\.css'/g, replace: "'@/styles/index.css'" }, // For main.tsx
];

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (const {search, replace} of importReplacements) {
    if (search.test(content)) {
      content = content.replace(search, replace);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${path.relative(root, file)}`);
  }
}
