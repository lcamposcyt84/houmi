const fs = require('fs');
const path = require('path');

const rewrites = {
  // 1. Fix Admin Page Default Export Type Error
  'src/app/admin/page.tsx': `
import { Navigate } from "react-router-dom";
export default function AdminPage() {
  return <Navigate to="/admin/dashboard" replace />;
}
`,
  // 2. Fix Store Home Page (remove top-level await)
  'src/app/(store)/page.tsx': `
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui";
import { ProductCard } from "@/components/products";
import { phpFetch } from "@/lib/php-client";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      phpFetch("products/get.php?featured=true&limit=8").then(res => res.json()),
      phpFetch("categories/get.php").then(res => res.json())
    ])
    .then(([productsRes, categoriesRes]) => {
      setFeaturedProducts(productsRes.products || []);
      setCategories(categoriesRes || []);
      setLoading(false);
    })
    .catch(console.error);
  }, []);

  if (loading) return <div className="p-12 text-center text-brand-text-muted">Cargando la tienda...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#0F2444] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-accent blur-3xl"></div>
          <div className="absolute top-1/2 right-10 w-64 h-64 rounded-full bg-blue-500 blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight mb-6">
              Todo lo que necesitas, <span className="text-brand-accent">a un clic de distancia</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
              Equipamiento, papelería, tecnología y más para tu hogar o negocio. 
              Calidad garantizada con envíos a toda Venezuela.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button variant="accent" size="lg" className="w-full sm:w-auto text-brand-primary">
                  Ver catálogo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-bold text-brand-text">Envíos Nacionales</h3>
                <p className="text-sm text-brand-text-muted">Despachos rápidos y seguros</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-bold text-brand-text">Pagos Seguros</h3>
                <p className="text-sm text-brand-text-muted">Bs, USD, Zelle y Facebank</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-bold text-brand-text">Atención Premium</h3>
                <p className="text-sm text-brand-text-muted">Soporte por WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-brand-text font-display mb-2">
                Nuestras Categorías
              </h2>
              <p className="text-brand-text-muted">Encuentra todo organizado para ti</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center text-brand-primary font-medium hover:underline">
              Ver todas <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.id}
                to={\`/products?category=\${category.slug}\`}
                className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-brand-primary hover:shadow-md transition-all text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-8 h-8 text-brand-primary/50 group-hover:text-brand-primary" />
                </div>
                <h3 className="font-medium text-brand-text line-clamp-2">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/products">
              <Button variant="outline" className="w-full">
                Ver todas las categorías
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-brand-text font-display mb-2">
                Productos Destacados
              </h2>
              <p className="text-brand-text-muted">La mejor selección para ti</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                exchangeRate={1}
              />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/products">
              <Button variant="primary" size="lg">
                Ver todo el catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
`,
  // 3. Fix Account Orders Page (remove top-level await)
  'src/app/account/orders/page.tsx': `
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, ArrowLeft } from "lucide-react";
import { formatUSD, formatBs } from "@/lib/currency";
import { Badge } from "@/components/ui";
import { getPhpApiBaseUrl, getToken } from "@/lib/php-client";

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const API_URL = getPhpApiBaseUrl();
        const token = getToken();

        const res = await fetch(\`\${API_URL}/orders/get.php\`, {
          headers: {
            Cookie: \`auth_token=\${token}\`,
            Authorization: token ? \`Bearer \${token}\` : ""
          },
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pendiente</Badge>;
      case "paid":
        return <Badge variant="success">Pagada</Badge>;
      case "shipped":
        return <Badge variant="accent">Enviada</Badge>;
      case "delivered":
        return <Badge variant="success">Entregada</Badge>;
      case "cancelled":
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="section mt-20">
      <div className="container-custom max-w-4xl">
        <Link
          to="/account"
          className="inline-flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mi cuenta
        </Link>

        <h1 className="text-3xl font-bold text-brand-text font-display mb-8 flex items-center gap-3">
          <Package className="w-8 h-8 text-brand-primary" />
          Mis Pedidos
        </h1>

        {loading ? (
          <p className="text-center text-brand-text-muted">Cargando...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-brand-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-brand-text mb-2">
              No tienes pedidos aún
            </h3>
            <p className="text-brand-text-muted mb-6">
              Cuando realices compras, aparecerán aquí.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-brand-primary hover:bg-blue-900 transition-colors"
            >
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-brand-text">
                        Pedido #{order.code}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-brand-text-muted">
                      {new Date(order.createdAt).toLocaleDateString("es-VE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-bold text-brand-primary text-xl">
                      {formatUSD(order.totalUsd)}
                    </p>
                    <p className="text-sm text-brand-text-muted">
                      {formatBs(order.totalVes)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-brand-text mb-3">
                    Artículos
                  </h4>
                  <ul className="space-y-2">
                    {order.items?.map((item: any) => (
                      <li
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-brand-text-muted">
                          {item.quantity}x {item.product?.name || 'Producto'}
                        </span>
                        <span className="font-medium text-brand-text">
                          {formatUSD(item.priceUsd * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`
};

// Write fixes
for (const [filePath, content] of Object.entries(rewrites)) {
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
  console.log('Rewritten:', filePath);
}

// Quick string replacements for the other files
let loginPagePath = 'src/app/(store)/login/page.tsx';
let loginContent = fs.readFileSync(loginPagePath, 'utf8');
loginContent = loginContent.replace(/if \(token\) \{/g, 'if (data.token) {');
loginContent = loginContent.replace(/auth_token=\$\{token\}/g, 'auth_token=${data.token}');
// Remove non-functional router instance
loginContent = loginContent.replace(/, router\]/g, ']');
fs.writeFileSync(loginPagePath, loginContent, 'utf8');

// Account page - fix customer null possibility
let accountPagePath = 'src/app/account/page.tsx';
let accountContent = fs.readFileSync(accountPagePath, 'utf8');
accountContent = accountContent.replace(/\/\/ Auth loaded by client hook\n/g, 
  'const [customer, setCustomer] = useState<any>(null);\n  useEffect(() => {\n    phpFetch("auth/me").then(r => r.json()).then(d => { if (d.customer) setCustomer(d.customer); });\n  }, []);\n\n  if (!customer) return <div className="p-12 text-center">Cargando perfil...</div>;\n');
// Adding imports if needed
if (!accountContent.includes('useState')) {
  accountContent = 'import { useState, useEffect } from "react";\nimport { phpFetch } from "@/lib/php-client";\n' + accountContent;
}
fs.writeFileSync(accountPagePath, accountContent, 'utf8');

// Products page - remove top level await
let productsPagePath = 'src/app/(store)/products/page.tsx';
// Replace content manually with string blocks that don't have parsing issues
const productsPageFixed = `
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Filter, ArrowUpDown } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Button } from "@/components/ui";
import { getProducts } from "@/lib/php-api";

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Extract real params
    const search = searchParams.get('q') || '';
    const categoryslug = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || '';
    const limit = 20;
    
    // Build query obj
    const paramsObj: any = { limit };
    if (search) paramsObj.search = search;
    if (categoryslug) paramsObj.categoryslug = categoryslug;
    if (sort) paramsObj.sort = sort;

    getProducts(paramsObj)
      .then(data => {
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(console.error);

  }, [searchParams]);

  if (loading) return <div className="p-12 text-center text-brand-text-muted">Cargando catálogo...</div>;

  return (
    <div className="section mt-24">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold font-display text-brand-text">
              Productos
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              Ver Filtros
            </Button>
          </div>

          {/* Sidebar Filters */}
          <aside
            className={\`\${
              showFilters ? "block" : "hidden"
            } md:block w-full md:w-64 lg:w-72 shrink-0\`}
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
              <ProductFilters categories={categories} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header info */}
            <div className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <h1 className="text-3xl font-bold font-display text-brand-text">
                Catálogo de Productos
              </h1>
            </div>

            <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-sm font-medium text-brand-text-muted">
                Mostrando <span className="text-brand-primary">{products.length}</span>{" "}
                de <span className="text-brand-primary">{total}</span> resultados
              </span>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    exchangeRate={1}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                <p className="text-lg font-medium text-brand-text mb-2">
                  No se encontraron productos
                </p>
                <p className="text-brand-text-muted mb-6">
                  Prueba cambiando los filtros o buscando con otros términos.
                </p>
                <Link to="/products">
                  <Button variant="outline">Ver todos los productos</Button>
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(productsPagePath, productsPageFixed, 'utf8');

console.log('Fixed Store Pages, Login Page and Account Page.');
