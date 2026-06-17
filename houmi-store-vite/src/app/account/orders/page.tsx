import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, ArrowLeft, Clock, CheckCircle, Truck, XCircle, Star, CheckCircle2 } from "lucide-react";
import { phpFetch } from "@/lib/php-client";
import { ReviewModal } from "@/components/reviews/ReviewModal";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  payment_pending: { label: "Pago pendiente", color: "bg-orange-100 text-orange-800", icon: Clock },
  paid: { label: "Pagado", color: "bg-green-100 text-green-800", icon: CheckCircle },
  completed: { label: "Completado", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-800", icon: CheckCircle },
};

export default function AccountOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [reviewedProductIds, setReviewedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ isOpen: false, productId: "", productName: "" });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [ordersRes, reviewsRes] = await Promise.all([
          phpFetch("orders/get.php"),
          phpFetch("reviews/my_reviews.php")
        ]);

        if (ordersRes.status === 401) {
          navigate("/login");
          return;
        }

        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.orders || []);
        }

        if (reviewsRes.ok) {
          const rData = await reviewsRes.json();
          if (rData.reviewedProductIds) {
            setReviewedProductIds(rData.reviewedProductIds);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container-custom py-12 max-w-5xl">
        <p className="text-center text-brand-text-muted animate-pulse">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <Link
          to="/account"
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
              {orders.length} pedido{orders.length !== 1 ? "s" : ""} en total
            </div>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="relative overflow-hidden bg-white border border-gray-100 shadow-sm rounded-[2.5rem] p-12 lg:p-20 text-center group">
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
              to="/products"
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
            const orderCode = order.orderNumber || order.code;

            return (
              <div
                key={order.id}
                className="group relative overflow-hidden bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 hover:shadow-xl hover:border-blue-100 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/0 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-50/50 transition-colors duration-500 pointer-events-none" />

                <div className="relative z-10">
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-brand-primary uppercase tracking-wider">Orden</span>
                        <span className="font-mono text-lg font-bold text-brand-text">#{orderCode}</span>
                      </div>
                      <p className="text-sm text-brand-text-muted flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString("es-VE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
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
                    <div className="bg-gray-50/50 border border-gray-100 rounded-[1.5rem] p-5 mb-4">
                      <p className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-4">
                        {order.items.length} producto{order.items.length !== 1 ? "s" : ""} comprados
                      </p>
                      <div className="space-y-3">
                        {order.items.slice(0, 3).map((item: any) => {
                          const productId = item.product?.id || item.productId;
                          const productName = item.product?.name || item.productName || "Producto";
                          const isReviewed = reviewedProductIds.includes(productId);
                          const canReview = ["paid", "shipped", "delivered", "completed"].includes(order.status);

                          return (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                  {item.quantity}
                                </span>
                                <span className="text-brand-text font-medium truncate max-w-[180px] sm:max-w-xs">
                                  {productName}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-brand-text font-bold">
                                  ${Number(item.priceUsd).toFixed(2)}
                                </span>
                                {canReview && productId && (
                                  isReviewed ? (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Calificado
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setReviewModal({ isOpen: true, productId, productName })}
                                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                                    >
                                      <Star className="w-3.5 h-3.5" />
                                      Reseña
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })}
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
                    <div className="mt-2 bg-blue-50/50 border border-blue-100 rounded-[1.5rem] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm text-brand-primary flex items-center justify-center">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-0.5">Información de Envío</p>
                          <p className="text-sm font-medium text-brand-text">{shipment.carrier || "Transportista"}</p>
                        </div>
                      </div>
                      {shipment.trackingUrl ? (
                        <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-brand-text font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
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

      <ReviewModal
        isOpen={reviewModal.isOpen}
        productId={reviewModal.productId}
        productName={reviewModal.productName}
        onClose={() => setReviewModal({ ...reviewModal, isOpen: false })}
        onSuccess={(productId) => setReviewedProductIds((prev) => [...prev, productId])}
      />
    </div>
  );
}
