const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    fs.statSync(p).isDirectory() ? walkDir(p, callback) : callback(p);
  });
}

console.log('Limpiando llamadas a server-side functions...');

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Remove Metadata export const
  if (content.includes('export const metadata') && content.includes('Metadata')) {
    content = content.replace(/export const metadata: Metadata = \{[^}]+\};\n?/g, '');
    content = content.replace(/export const metadata = \{[^}]+\};\n?/g, '');
    changed = true;
  }

  // Remove getAdminSession calls - replace with simple auth check from localStorage
  if (content.includes('getAdminSession()')) {
    // Replace: const session = await getAdminSession(); with a local check
    content = content.replace(/const session = await getAdminSession\(\);\n?/g, '');
    // Remove any if (!session) redirect or similar
    content = content.replace(/if \(!session\)[^}]+\}\n?/g, '');
    changed = true;
  }

  // Remove getAuthenticatedCustomer() calls
  if (content.includes('getAuthenticatedCustomer()')) {
    content = content.replace(/const customer = await getAuthenticatedCustomer\(\);\n?/g, 'const customer = null; // Auth handled by client\n');
    changed = true;
  }

  // Remove cookies() calls
  if (content.includes('cookies()')) {
    content = content.replace(/const cookieStore = await cookies\(\);\n?/g, '');
    content = content.replace(/const token = cookieStore[^\n]+\n?/g, '');
    changed = true;
  }

  // Remove redirect() from react-router-dom (it's useNavigate now)
  if (content.includes('import { redirect }')) {
    content = content.replace(/import \{ redirect \} from "react-router-dom";\n?/g, '');
    changed = true;
  }

  // Remove standalone redirect('/admin/login') calls
  if (content.includes('redirect(')) {
    content = content.replace(/redirect\(['"][^'"]+['"]\);\n?/g, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
    console.log('Fixed server calls:', filePath);
  }
});

console.log('Limpieza de server calls completada.');
