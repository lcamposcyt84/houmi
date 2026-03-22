import { useState, useEffect } from "react";
import { phpFetch } from "@/lib/php-client";
import { Link, useNavigate } from "react-router-dom";
import { Package, Heart, LogOut, ShieldCheck, UserCircle2, ArrowLeft } from "lucide-react";
import { AvatarUpload } from "./AvatarUpload";
import { LogoutButton } from "./LogoutButton";

export default function AccountPage() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    phpFetch("auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => { 
        if (d?.customer) {
          setCustomer(d.customer);
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Cargando...</div>;
  if (!customer) return null;

  return (
    <div className="container-custom py-12 max-w-5xl">
      <div className="mb-10 text-center md:text-left">
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-text-muted hover:text-brand-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-display mb-2">Mi Espacio</h1>
        <p className="text-brand-text-muted">Gestiona tu perfil, ubica tus pedidos y guarda tus favoritos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Identity Card (Bento span 2) */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#1B3A6D] via-[#0F2444] to-[#0A1830] rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 group">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-primary/30 transition-colors duration-700 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="flex items-center gap-5">
                <AvatarUpload 
                  currentAvatar={customer?.avatar} 
                  initials={`${customer?.firstName?.charAt(0) || ''}${customer?.lastName?.charAt(0) || ''}`}
                />
                <div>
                  <p className="text-blue-200/80 font-medium mb-1 drop-shadow-sm text-sm uppercase tracking-widest">¡Hola de nuevo!</p>
                  <h2 className="text-3xl font-bold font-display drop-shadow-md">
                    {customer?.firstName} {customer?.lastName}
                  </h2>
                </div>
              </div>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl">
                <ShieldCheck className="w-4 h-4 text-brand-accent" />
                <span className="text-sm font-semibold text-white">Cliente Verificado</span>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/20 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-inner">
              <div className="flex flex-col gap-1">
                <span className="text-blue-200/60 text-xs uppercase tracking-wider font-semibold">Correo electrónico</span>
                <span className="font-medium text-lg truncate">{customer?.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-blue-200/60 text-xs uppercase tracking-wider font-semibold">Teléfono móvil</span>
                <span className="font-medium text-lg">{customer?.phone || "No registrado"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards (Stacked vertically on desktop to fill the 3rd column) */}
        <div className="flex flex-col gap-6">
          {/* Orders */}
          <Link to="/account/orders" className="group flex-1 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100/50 transition-colors pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div className="w-16 h-16 bg-blue-50 text-brand-primary rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 shadow-sm">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-text mb-2 group-hover:text-brand-primary transition-colors">Mis Pedidos</h3>
                <p className="text-sm text-brand-text-muted leading-relaxed">Rastrea tus envíos y revisa tu historial de compras.</p>
              </div>
            </div>
          </Link>

          {/* Wishlist */}
          <Link to="/account/wishlist" className="group flex-1 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-red-100 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-50/50 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-red-100/50 transition-colors pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-text mb-2 group-hover:text-red-500 transition-colors">Lista de Deseos</h3>
                <p className="text-sm text-brand-text-muted leading-relaxed">Tus productos favoritos guardados para más tarde.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer actions / Info */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          {/* Member since metadata */}
          <div className="md:col-span-2 bg-gray-50/50 rounded-[2rem] p-8 flex items-center gap-6 border border-gray-100">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-gray-100">
              <UserCircle2 className="w-7 h-7 text-gray-400" />
            </div>
            <div>
              <h3 className="font-bold text-brand-text">Información de la cuenta</h3>
              <p className="text-sm text-brand-text-muted mt-1">
                Miembro activo desde el {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString("es-VE", { year: "numeric", month: "long", day: "numeric" }) : "hoy"}
              </p>
            </div>
          </div>

          {/* Logout Action */}
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
