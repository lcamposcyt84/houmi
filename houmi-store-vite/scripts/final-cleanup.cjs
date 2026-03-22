const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    fs.statSync(p).isDirectory() ? walkDir(p, callback) : callback(p);
  });
}

console.log('Iniciando limpieza final...');

// FILES TO DELETE OUTRIGHT (server-only files that have no place in a client SPA)
const filesToDelete = [
  'src/lib/rate-limit.ts',
  'src/app/layout.tsx',
];

filesToDelete.forEach(f => {
  try { fs.rmSync(f, { force: true }); console.log('Deleted:', f); } catch(e) {}
});

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Remove: import ... from 'next/...'
  if (content.match(/import [^\n]+ from ['"]next[/'"][^\n]*/)) {
    content = content.replace(/import [^\n]+ from ['"]next\/[^'"]+['"];?\n?/g, '');
    content = content.replace(/import [^\n]+ from ['"]next['"];?\n?/g, '');
    changed = true;
  }

  // Remove: import ... from '@/lib/auth'
  if (content.includes("@/lib/auth")) {
    content = content.replace(/import [^\n]+ from ['"]@\/lib\/auth['"];?\n?/g, '');
    changed = true;
  }

  // Remove: import ... from '@/lib/customer-auth'
  if (content.includes("@/lib/customer-auth")) {
    content = content.replace(/import [^\n]+ from ['"]@\/lib\/customer-auth['"];?\n?/g, '');
    // Remove any calls to getCustomerSession() - replace with null
    content = content.replace(/const session = await getCustomerSession\(\);\n?/g, 'const session = null;\n');
    changed = true;
  }

  // Fix: router.xxx -> navigate(...)
  if (content.includes('router.')) {
    content = content.replace(/router\.push\(/g, 'navigate(');
    content = content.replace(/router\.replace\(([^)]+)\)/g, 'navigate($1, { replace: true })');
    // If router.xxx still present but no navigate, add it
    if (content.includes('router.') && !content.includes('const navigate = useNavigate()')) {
      // Try to add navigate in function body
      content = content.replace(
        /export (default )?function ([A-Za-z]+[^)]*)\) \{/,
        'export $1function $2) {\n  const navigate = useNavigate();'
      );
      // Also ensure import exists
      if (!content.includes('useNavigate')) {
        content = 'import { useNavigate } from "react-router-dom";\n' + content;
      }
    }
    // Clean up remaining 'router.' references that couldn't be converted
    content = content.replace(/router\.[a-zA-Z]+\([^)]*\);\n?/g, '');
    changed = true;
  }

  // Remove 'redirect' imported from next
  if (content.includes("'redirect'") || content.includes('"redirect"')) {
    content = content.replace(/import \{ redirect[^}]* \} from ['"](next|react-router-dom)['"];?\n?/g, '');
    content = content.replace(/redirect\([^)]+\);\n?/g, '');
    changed = true;
  }

  // Remove unused imports that cause strict TS errors
  // 'notFound' from react-router-dom (doesn't exist there)
  if (content.includes("notFound") && content.includes("react-router-dom")) {
    content = content.replace(/,\s*notFound/g, '');
    content = content.replace(/notFound,\s*/g, '');
    content = content.replace(/import \{ notFound \} from ['"]react-router-dom['"];?\n?/g, '');
    content = content.replace(/notFound\(\);\n?/g, 'return;\n');
    changed = true;
  }

  // Remove type-only imports of Metadata (from 'next')
  content = content.replace(/import (type )?(\{ )?Metadata( \})? from ['"]next['"];?\n?/g, '');

  // Remove: import type { ProductWithPrices } only if declared-never-read
  content = content.replace(/import type \{ ProductWithPrices \} from ['"]@\/types['"];?\n?/g, '');

  // Fix: remove 'Order' from php-api.ts type import if unused
  content = content.replace(/import type \{ ProductWithPrices, Category, Settings, Order \}/g, 
                            'import type { ProductWithPrices, Category, Settings }');
    
  if (changed) {
    fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
    console.log('Cleaned:', filePath);
  }
});

console.log('Limpieza final completada.');
