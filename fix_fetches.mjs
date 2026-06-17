import fs from 'fs';
import path from 'path';

// Define the root directory of the admin app
const adminDir = 'c:/xampp/htdocs/houmi-master/houmi-store-vite/src/app/admin';

// Reemplazos específicos
const replacements = [
  // Productos y Ajustes
  { from: /fetch\("\/api\/admin\/products\"\)/g, to: 'phpFetch("admin/products/get.php")' },
  { from: /fetch\("\/api\/settings\"\)/g, to: 'phpFetch("admin/settings/get.php")' },
  
  // Ventas y Compras
  { from: /fetch\("\/api\/admin\/sales",\s*\{/g, to: 'phpFetch("admin/sales/create.php", {' },
  { from: /fetch\("\/api\/admin\/sales\"\)/g, to: 'phpFetch("admin/sales/get.php")' },
  { from: /fetch\("\/api\/admin\/purchases",\s*\{/g, to: 'phpFetch("admin/purchases/create.php", {' },
  { from: /fetch\("\/api\/admin\/purchases\"\)/g, to: 'phpFetch("admin/purchases/get.php")' },
  
  // Pagos y Órdenes
  { from: /fetch\("\/api\/admin\/payments"\)/g, to: 'phpFetch("admin/payments/get.php")' },
  { from: /fetch\(`\/api\/admin\/orders\/\$\{orderId\}`,\s*\{/g, to: 'phpFetch("admin/orders/update.php", {' },
  
  // Importaciones de Catálogo
  { from: /fetch\("\/api\/admin\/import-excel",\s*\{/g, to: 'phpFetch("admin/catalog/import.php", {' },
  { from: /fetch\("\/api\/admin\/import-excel"\)/g, to: 'phpFetch("admin/catalog/import.php")' },
  { from: /fetch\("\/api\/admin\/fix-slugs",\s*\{/g, to: 'phpFetch("admin/catalog/fix-slugs.php", {' },
  
  // Gastos
  { from: /fetch\("\/api\/admin\/expenses",\s*\{/g, to: 'phpFetch("admin/expenses/create.php", {' },
  { from: /fetch\(`\/api\/admin\/expenses\/\$\{id\}`,\s*\{/g, to: 'phpFetch("admin/expenses/update.php", {' },
  
  // Header / Auth
  { from: /fetch\("\/api\/admin\/logout",\s*\{/g, to: 'phpFetch("admin/logout.php", {' },
  
  // Precios en Masa
  { from: /fetch\("\/api\/admin\/bulk-price",\s*\{/g, to: 'phpFetch("admin/bulk-price.php", {' }
];

// Helper to find files recursively
function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const files = walkSync(adminDir);
let changedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // We are looking for files that still have old Next.js fetch API
  if (content.includes('fetch("/api/') || content.includes('fetch(`/api/')) {
    console.log(`Processing: ${file}`);
    
    // Si no tiene el import de phpFetch, se lo agregamos
    if (!content.includes('phpFetch')) {
        // Encontrar los imports de React o lucide-react y ponerlo debajo
        content = content.replace(/(import .*;\n)/, '$1import { phpFetch } from "@/lib/php-client";\n');
        
        // Si no encontró donde insertarlo (ej, no tiene ni un import normal con punto y coma final)
        if (!content.includes('@/lib/php-client')) {
            content = 'import { phpFetch } from "@/lib/php-client";\n' + content;
        }
    }

    // Apply strict regex replacements
    for (const pat of replacements) {
       content = content.replace(pat.from, pat.to);
    }
    
    if (content !== original) {
      fs.writeFileSync(file, content);
      changedCount++;
      console.log(`-> Fixed: ${path.basename(file)}`);
    } else {
      console.log(`-> No matches found for fix logic in: ${path.basename(file)}`);
    }
  }
}

console.log(`Finished processing. ${changedCount} files updated.`);
