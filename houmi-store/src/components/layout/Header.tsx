"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ShoppingCart, Search, UserCircle, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Productos", href: "/products" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { getTotalItems, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<{ firstName: string; email: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check customer session silently
    fetch("/api/v1/auth/me")
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

  const totalItems = mounted ? getTotalItems() : 0;

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    setCustomer(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-white"
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image
                src="/brand/logo.png"
                alt="Houmi"
                fill
                className="object-contain"
                priority
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
                href={item.href}
                className={cn(
                  "text-base font-medium transition-colors duration-200",
                  pathname === item.href
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
              href="/products"
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
                    href="/account"
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors text-sm font-medium text-brand-text-muted hover:text-brand-primary"
                    title={customer.email}
                  >
                    <UserCircle className="w-5 h-5" />
                    <span className="hidden lg:block">{customer.firstName}</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-primary hover:text-brand-primary transition-colors text-sm font-medium text-brand-text-muted"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>
              )
            )}

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={`Carrito (${totalItems} items)`}
            >
              <ShoppingCart className="w-5 h-5 text-brand-text-muted" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-brand-accent text-brand-primary text-xs font-bold rounded-full">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Menú"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    pathname === item.href
                      ? "bg-blue-900/10 text-brand-primary"
                      : "text-brand-text-muted hover:bg-gray-100"
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {/* Customer auth in mobile menu */}
              <div className="pt-2 mt-2 border-t border-gray-100">
                {mounted && customer ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-brand-text-muted hover:bg-gray-100 transition-colors"
                    >
                      <UserCircle className="w-5 h-5 text-brand-primary" />
                      Mi cuenta — {customer.firstName}
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogIn className="w-5 h-5 rotate-180" />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-brand-primary hover:bg-blue-50 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}


