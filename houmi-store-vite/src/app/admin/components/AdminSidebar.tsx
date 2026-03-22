
import { Link } from "react-router-dom";

import { useLocation } from "react-router-dom";
import { 
  Package, 
  Settings, 
  Percent, 
  LayoutDashboard, 
  ExternalLink,
  ShoppingCart,
  Wallet,
  TrendingUp,
  FileSpreadsheet,
  ClipboardList,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Pedidos",
    href: "/admin/orders",
    icon: ClipboardList,
  },
  {
    name: "Pagos",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    name: "Productos",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Importar Excel",
    href: "/admin/import",
    icon: FileSpreadsheet,
  },
  {
    name: "Ventas",
    href: "/admin/sales",
    icon: ShoppingCart,
  },
  {
    name: "Compras",
    href: "/admin/purchases",
    icon: TrendingUp,
  },
  {
    name: "Gastos",
    href: "/admin/expenses",
    icon: Wallet,
  },
  {
    name: "Precios en lote",
    href: "/admin/bulk-pricing",
    icon: Percent,
  },
  {
    name: "Configuración",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-brand-primary text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="relative w-10 h-10 bg-white rounded-lg p-1">
            <img src="/brand/logo.png"
              alt="Houmi"
              className="w-full h-full object-cover object-contain"
            />
          </div>
          <div>
            <span className="text-xl font-bold font-display">Houmi</span>
            <span className="block text-xs text-white/60">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* View store link */}
      <div className="p-4 border-t border-white/10">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          Ver tienda
        </Link>
      </div>
    </aside>
  );
}





