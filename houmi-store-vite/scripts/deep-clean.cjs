const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    fs.statSync(p).isDirectory() ? walkDir(p, callback) : callback(p);
  });
}

const patterns = [
  // Remove 'token' references left over from cookie removal
  [/const token = [^\n]+\n?/g, ''],
  [/headers: \{ Cookie: `admin_token=\$\{token\}` \},\n?/g, ''],
  [/   Cookie: `auth_token=\$\{token\}`\n?/g, ''],
  [/Cookie: `admin_token=\$\{token\}`[^\n]*\n?/g, ''],
  [/Cookie: `auth_token=\$\{token\}`[^\n]*\n?/g, ''],
  // Remove 'session' references (without proper context)
  [/if \(!session\)[^\n]*\n?/g, ''],
  [/if \(session\)[^\n]*\n?/g, ''],
  [/const session = null;[^\n]*\n?/g, ''],
  // Remove Metadata type usage
  [/: Metadata/g, ''],
  [/: Promise<Metadata>/g, ''],
  // Remove duplicate router references in useEffect
  [/, router\]/g, ']'],
  [/\[router, /g, '['],
  [/\[router\]/g, '[]'],
  // Clean ProductPageProps interface
  [/interface ProductPageProps \{\n\s+params: Promise<\{ slug: string \}>;\n\}/g, ''],
  [/: ProductPageProps\) \{/g, ') {'],
  [/\{ params \}: ProductPageProps/g, ''],
  // Remove async from page functions still remaining
  [/export default async function/g, 'export default function'],
  // Remove generateMetadata function 
  [/export async function generateMetadata\([\s\S]*?\n\}\n?/g, ''],
  // Remove const declarations at module level (left by cleanup)
  [/^const customer = null;[^\n]*\n?/gm, '// Auth loaded by client hook\n'],
  // Remove references to the notFound from react-router-dom
  [/\{ notFound \} from "react-router-dom"/g, '{ } from "react-router-dom"'],
  [/notFound\(\);/g, 'return <div>Producto no encontrado</div>;'],
];

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [pattern, replacement] of patterns) {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
    console.log('Deep-cleaned:', filePath);
  }
});

console.log('Deep clean completado.');
