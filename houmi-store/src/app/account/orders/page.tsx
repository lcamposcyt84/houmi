import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { Package, ArrowLeft, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-auth";

// Types defined manually — Prisma client pending regeneration (prisma generate blocked by dev server DLL lock)
interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  priceUsd: number;
}

interface Shipment {
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalUsd: number;
  createdAt: Date;
  items: OrderItem[];
  shipments: Shipment[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  payment_pending: { label: "Pago pendiente", color: "bg-orange-100 text-orange-800", icon: Clock },
  paid: { label: "Pagado", color: "bg-green-100 text-green-800", icon: CheckCircle },
  completed: { label: "Completado", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800", icon: Truck },
};

export default async function AccountOrdersPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/houmi-master/houmi-store/api";

  let orders: Order[] = [];
  try {
    const res = await fetch(`${API_URL}/orders/get.php`, {
      headers: {
        Cookie: `auth_token=${token}`
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      orders = data.orders || [];
    }
  } catch (e) {
    console.error("Failed to fetch orders from PHP backend", e);
  }

  return (
    <div className="container-custom py-12 max-w-5xl">
      <div className="mb-10 text-center md:text-left">
        <Link 
          href="/account" 
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-text-muted hover:text-brand-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mi Espacio
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-display mb-2">Mis Pedidos</h1>
            <p className="text-brand-text-muted">Rastrea tus envíos y revisa tu historial de compras.</p>
          </div>
          {orders.length > 0 && (
            <div className="px-4 py-2 bg-blue-50 text-brand-primary font-semibold rounded-2xl border border-blue-100">
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} en total
            </div>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="relative overflow-hidden bg-white border border-gray-100 shadow-sm rounded-[2.5rem] p-12 lg:p-20 text-center group">
          {/* Decorative blurs for empty state */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-primary/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-brand-primary/10 transition-colors duration-700" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50/80 backdrop-blur-sm border border-gray-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Package className="w-10 h-10 text-gray-400 group-hover:text-brand-primary transition-colors duration-500" />
            </div>
            <h2 className="text-2xl font-bold font-display text-brand-text mb-3">No tienes pedidos aún</h2>
            <p className="text-brand-text-muted mb-8 max-w-md mx-auto text-lg">
              Tu historial de compras está vacío. ¡Explora nuestro catálogo y descubre productos increíbles!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-primary text-white font-semibold rounded-[1.5rem] hover:bg-brand-primary-dark hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary/20 transition-all duration-300"
            >
              Explorar el catálogo
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => {
            const cfg = statusConfig[order.status] ?? {
              label: order.status,
              color: "bg-gray-100 text-gray-700",
              icon: Clock,
            };
            const StatusIcon = cfg.icon;
            const shipment = order.shipments?.[0];

            return (
              <div
                key={order.id}
                className="group relative overflow-hidden bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 hover:shadow-xl hover:border-blue-100 transition-all duration-300"
              >
                {/* Subtle hover gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/0 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-50/50 transition-colors duration-500 pointer-events-none" />
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-brand-primary uppercase tracking-wider">Orden</span>
                        <span className="font-mono text-lg font-bold text-brand-text">#{order.orderNumber}</span>
                      </div>
                      <p className="text-sm text-brand-text-muted flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString("es-VE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-white/20 ${cfg.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {cfg.label}
                      </span>
                      <p className="text-2xl font-black font-display text-brand-text">
                        ${Number(order.totalUsd).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  {order.items?.length > 0 && (
                    <div className="bg-gray-50/50 border border-gray-100 rounded-[1.5rem] p-5 mb-2">
                      <p className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-4">
                        {order.items.length} producto{order.items.length !== 1 ? 's' : ''} comprados
                      </p>
                      <div className="space-y-3">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                {item.quantity}
                              </span>
                              <span className="text-brand-text font-medium truncate max-w-[200px] sm:max-w-xs">{item.productName}</span>
                            </div>
                            <span className="text-brand-text font-bold">
                              ${Number(item.priceUsd).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs font-medium text-brand-primary mt-2">
                            + {order.items.length - 3} producto(s) adicional(es)
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tracking */}
                  {shipment?.trackingNumber && (
                    <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-[1.5rem] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm text-brand-primary flex items-center justify-center">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-0.5">Información de Envío</p>
                          <p className="text-sm font-medium text-brand-text">
                            {shipment.carrier || "Transportista"}
                          </p>
                        </div>
                      </div>
                      
                      {shipment.trackingUrl ? (
                        <a
                          href={shipment.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-brand-text font-bold text-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                        >
                          Rastrear: <span className="font-mono ml-1 text-brand-primary">{shipment.trackingNumber}</span>
                        </a>
                      ) : (
                        <div className="px-4 py-2 bg-white border border-gray-200 text-brand-text font-bold text-sm rounded-xl shadow-sm">
                          Tracking: <span className="font-mono ml-1 text-gray-600">{shipment.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
