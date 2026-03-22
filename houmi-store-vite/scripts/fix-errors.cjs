const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // 1. Convertir import de tipos a import type
    if (content.includes('import { ProductWithPrices, Category, Settings, Order } from "@/types";')) {
       content = content.replace('import { ProductWithPrices, Category, Settings, Order } from "@/types";', 'import type { ProductWithPrices, Category, Settings, Order } from "@/types";');
       hasChanges = true;
    }
    
    // 2. Errores de React Router Link (Links envueltos de Next Link)
    // Next usaba <Link href="..."> <span /> </Link>, en v12- o custom.
    // También arreglar <Link href="..."> por <Link to="...">
    if (content.match(/<Link\s+[^>]*href=/g)) {
        content = content.replace(/(<Link\s+[^>]*?)href=/g, '$1to=');
        hasChanges = true;
    }

    // 3. Remover atributo `priority` que Next Image usaba y `img` nativo no acepta
    if (content.includes('priority=')) {
        // priority={true} o priority
        content = content.replace(/\s+priority(?:=\{?(?:true|false)\}?)?/g, '');
        hasChanges = true;
    }

    // 4. Múltiples className por culpa del reemplazo anterior de "fill" y "img" attrs
    // Ya que "fill" introdujo un className="w-full h-full object-cover"
    // Buscamos algo rudo pero factible por ahora
    if (content.includes('className="w-full h-full object-cover"')) {
       // Si hay otro className al lado, los fusionamos a nivel texto (crudo pero suficiente)
       content = content.replace(/className="w-full h-full object-cover"\s*className="([^"]+)"/g, 'className="w-full h-full object-cover $1"');
       content = content.replace(/className="([^"]+)"\s*className="w-full h-full object-cover"/g, 'className="$1 w-full h-full object-cover"');
       hasChanges = true;
    }
    
    // 5. Arreglar react-router-dom useSearchParams tuple 
    // const [searchParams] = useSearchParams(); searchParams.get('x') en Next era const searchParams = useSearchParams();
    if (content.match(/const\s+searchParams\s*=\s*useSearchParams\(\)/)) {
        content = content.replace(/const\s+searchParams\s*=\s*useSearchParams\(\)/g, 'const [searchParams] = useSearchParams()');
        hasChanges = true;
    }
    
    // 6. Arreglar "router" no está definido por el replace previo que lo quitó si no tenía const
    if (content.includes('router.push') || content.includes('router.replace')) {
        content = content.replace(/router\.push/g, 'navigate');
        content = content.replace(/router\.replace/g, 'navigate');
        if(!content.includes('const navigate')) {
          content = content.replace(/function [^)]+\)\s*\{/, "$&\n  const navigate = useNavigate();");
        }
        hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fijado: ${filePath}`);
    }
  }
});
