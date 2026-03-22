const fs = require('fs');

// 1. Fix src/app/(store)/page.tsx
let homeFile = 'src/app/(store)/page.tsx';
let homeContent = fs.readFileSync(homeFile, 'utf8');
homeContent = homeContent.replace(/exchangeRate=\{1\}\n/g, '');
homeContent = homeContent.replace(/exchangeRate=\{1\}/g, '');
fs.writeFileSync(homeFile, homeContent, 'utf8');

// 2. Fix src/app/(store)/products/page.tsx
let prodFile = 'src/app/(store)/products/page.tsx';
let prodContent = fs.readFileSync(prodFile, 'utf8');
prodContent = prodContent.replace(/exchangeRate=\{1\}\n/g, '');
prodContent = prodContent.replace(/exchangeRate=\{1\}/g, '');
prodContent = prodContent.replace(/import \{ getProducts \} from/g, 'import { fetchProducts } from');
prodContent = prodContent.replace(/getProducts\(/g, 'fetchProducts(');
fs.writeFileSync(prodFile, prodContent, 'utf8');

// 3. Fix src/app/account/orders/page.tsx
let ordersFile = 'src/app/account/orders/page.tsx';
let ordersContent = fs.readFileSync(ordersFile, 'utf8');
ordersContent = ordersContent.replace(/variant="accent"/g, 'variant="default"');
ordersContent = ordersContent.replace(/variant="danger"/g, 'variant="error"');
ordersContent = ordersContent.replace(/variant="secondary"/g, 'variant="default"');
ordersContent = ordersContent.replace(/import \{ getPhpApiBaseUrl, getToken \} from "@/lib\/php-client";/g, 'import { getToken, getPhpApiBaseUrl } from "@/lib/php-api-base-url";');
// The import is wrong, we need both phpFetch and getToken, but getPhpApiBaseUrl is from php-api-base-url or php-client? 
// Actually, let's just use phpFetch for the orders request
ordersContent = ordersContent.replace(
  /const fetchOrders = async \(\) => \{\s+try \{\s+const API_URL = getPhpApiBaseUrl\(\);\s+const token = getToken\(\);\s+const res = await fetch\(`\$\{API_URL\}\/orders\/get\.php`, \{\s+headers: \{\s+Cookie: `auth_token=\$\{token\}`,\s+Authorization: token \? `Bearer \$\{token\}` : ""\s+\},\s+\}\);/,
  `const fetchOrders = async () => {
      try {
        const { phpFetch } = await import("@/lib/php-client");
        const res = await phpFetch("orders/get.php");`
);
fs.writeFileSync(ordersFile, ordersContent, 'utf8');

// 4. Fix src/app/account/page.tsx (customer optional chaining)
let accFile = 'src/app/account/page.tsx';
let accContent = fs.readFileSync(accFile, 'utf8');
accContent = accContent.replace(/customer\.avatar/g, 'customer?.avatar');
accContent = accContent.replace(/customer\.firstName/g, 'customer?.firstName');
accContent = accContent.replace(/customer\.lastName/g, 'customer?.lastName');
accContent = accContent.replace(/customer\.email/g, 'customer?.email');
accContent = accContent.replace(/customer\.phone/g, 'customer?.phone');
accContent = accContent.replace(/customer\.createdAt/g, 'customer?.createdAt || new Date()');
fs.writeFileSync(accFile, accContent, 'utf8');

console.log("TS fixes applied");
