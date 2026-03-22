const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

console.log("Iniciando refactor automático...");

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // 1. Quitar next/image por img
    if (content.includes('import Image from "next/image"')) {
      content = content.replace(/import Image from "next\/image";?/g, '');
      content = content.replace(/<Image\s([^>]*)>/g, (match, attrs) => {
        // Remover width, height si están quemados para la imagen de next y dejarlos a CSS
        let newAttrs = attrs.replace(/\b(width|height)=\{[^}]*\}\s*/g, '');
        newAttrs = newAttrs.replace(/\b(priority)\b/g, ''); // next/image specific
        newAttrs = newAttrs.replace(/\b(fill)\b/g, 'className="w-full h-full object-cover"'); // next/image specific
        return `<img ${newAttrs.trim()} />`;
      });
      hasChanges = true;
    }

    // 2. Cambiar next/link por react-router-dom Link
    if (content.includes('import Link from "next/link"')) {
      content = content.replace(/import Link from "next\/link";?/g, 'import { Link } from "react-router-dom";');
      hasChanges = true;
    }

    // 3. React Router navigation
    if (content.includes('next/navigation')) {
      content = content.replace(/import {([^}]*)} from "next\/navigation";?/g, (match, imports) => {
        let cleanImports = imports.replace(/\b(useRouter|usePathname|useSearchParams)\b/g, (hook) => {
            if (hook === 'useRouter') return 'useNavigate';
            if (hook === 'usePathname') return 'useLocation';
            if (hook === 'useSearchParams') return 'useSearchParams';
            return hook;
        });
        return `import { ${cleanImports.trim()} } from "react-router-dom";`;
      });
      // Replace useRouter() hook usage
      content = content.replace(/const router = useRouter\(\)/g, 'const navigate = useNavigate()');
      content = content.replace(/router\.push/g, 'navigate');
      content = content.replace(/router\.replace\(([^)]+)\)/g, 'navigate($1, { replace: true })');
      
      // Replace usePathname()
      content = content.replace(/const pathname = usePathname\(\)/g, 'const { pathname } = useLocation()');
      hasChanges = true;
    }

    // 4. Eliminar "use client"
    if (content.includes('"use client"')) {
      content = content.replace(/"use client";?\n?/g, '');
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Refactorizado: ${filePath}`);
    }
  }
});
console.log("Refactor completado.");
