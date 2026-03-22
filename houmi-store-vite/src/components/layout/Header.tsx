import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, Search, UserCircle, LogIn, ArrowRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { phpFetch, clearToken } from "@/lib/php-client";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Categorías", href: "/categories" },
  { name: "Productos", href: "/products" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { getTotalItems, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<{ firstName: string; email: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check customer session silently
    phpFetch("auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.customer) setCustomer(data.customer); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isMenuOpen]);

  const totalItems = mounted ? getTotalItems() : 0;

  const handleLogout = async () => {
    clearToken();
    await phpFetch("auth/logout", { method: "POST" });
    setCustomer(null);
    navigate("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-white"
      )}
    >
      <div className="container-custom relative">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <img
                src="/brand/logo.png"
                alt="Houmi"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl md:text-2xl font-bold text-brand-primary font-display">
              Houmi
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-base font-medium transition-colors duration-200 py-6",
                  pathname.startsWith(item.href) && item.href !== "/" || (item.href === "/" && pathname === "/")
                    ? "text-brand-primary"
                    : "text-brand-text-muted hover:text-brand-primary"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search (desktop) */}
            <Link
              to="/products"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Buscar productos"
            >
              <Search className="w-5 h-5 text-brand-text-muted" />
            </Link>

            {/* Customer Auth Button */}
            {mounted && (
              customer ? (
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    to="/account"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 hover:border-brand-primary hover:bg-white hover:shadow-sm transition-all text-sm font-semibold text-brand-text-muted hover:text-brand-primary"
                    title={customer.email}
                  >
                    <UserCircle className="w-5 h-5" />
                    <span className="hidden lg:block">{customer.firstName}</span>
                  </Link>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-primary text-white hover:bg-blue-800 transition-colors text-sm font-semibold shadow-sm shadow-brand-primary/20 hover:shadow-md hover:-translate-y-0.5"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>
              )
            )}

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-100 hover:border-brand-primary hover:bg-white hover:text-brand-primary hover:shadow-sm transition-all"
              aria-label={`Carrito (${totalItems} items)`}
            >
              <ShoppingCart className="w-5 h-5 text-brand-text-muted hover:text-brand-primary transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-brand-accent text-brand-primary text-[10px] font-black rounded-full shadow-sm border-2 border-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Abrir Menú"
            >
              <Menu className="w-6 h-6 text-brand-text" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          MOBILE SIDEBAR (PREMIUM DRAWER)
          ========================================= */}
      
      {/* Backdrop Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-[#0F2444]/60 backdrop-blur-[6px] z-50 md:hidden transition-all duration-500",
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Drawer Container */}
      <div 
        className={cn(
          "fixed top-0 right-0 bottom-0 w-[88vw] max-w-[400px] bg-white z-50 md:hidden shadow-[-20px_0_50px_rgba(0,0,0,0.2)] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col overflow-hidden",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 bg-white shrink-0 shadow-sm z-10 pointer-events-auto">
          <span className="text-2xl font-bold text-brand-primary font-display flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <img src="/brand/logo.png" alt="Houmi" className="w-full h-full object-contain" />
            </div>
            Houmi
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 hover:rotate-90 transition-all duration-300 pointer-events-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 pb-24 scrollbar-hide pointer-events-auto">
          
          {/* User Widget */}
          {mounted && customer ? (
            <div className="bg-gradient-to-br from-[#1B3A6D] to-[#0F2444] rounded-[2rem] p-6 text-white mb-10 shadow-xl shadow-blue-900/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
              
              <div className="flex items-center gap-4 relative z-10 mb-6">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                  <UserCircle className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-0.5">Bienvenido</p>
                  <h4 className="font-bold text-xl leading-tight font-display">{customer.firstName}</h4>
                </div>
              </div>
              
              <Link 
                to="/account" 
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-3.5 bg-white/10 hover:bg-white border border-white/20 hover:border-white rounded-xl text-sm font-bold text-white hover:text-brand-primary transition-all duration-300 flex items-center justify-center gap-2 relative z-10 shadow-sm"
              >
                Mi Espacio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="mb-10 p-6 bg-gradient-to-br from-gray-50 to-white rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-brand-primary rounded-2xl flex items-center justify-center mb-4">
                <LogIn className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-brand-text text-lg mb-2">Ingresa a tu cuenta</h4>
              <p className="text-sm text-brand-text-muted mb-6 leading-relaxed">Guarda tus favoritos, rastrea tus pedidos y disfruta la mejor experiencia.</p>
              <Link
                 to="/login"
                 onClick={() => setIsMenuOpen(false)}
                 className="flex items-center justify-center w-full py-3.5 bg-brand-primary hover:bg-blue-800 text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 transition-all hover:-translate-y-0.5"
              >
                Iniciar Sesión
              </Link>
            </div>
          )}

          {/* Main Menu Nav */}
          <div className="mb-10">
            <h4 className="text-[10px] font-black text-gray-400/80 uppercase tracking-[0.2em] mb-4">Navegación principal</h4>
            <div className="flex flex-col gap-2">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl text-xl font-bold text-brand-text hover:bg-gray-50 hover:text-brand-primary transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Logout (Sticky Bottom) */}
        {customer && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 pb-safe z-20 pointer-events-auto">
             <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm group"
             >
               <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
               Cerrar Sesión
             </button>
          </div>
        )}
      </div>
    </header>
  );
}
