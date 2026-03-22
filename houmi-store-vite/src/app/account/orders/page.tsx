import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, ArrowLeft } from "lucide-react";
import { formatUSD, formatBs } from "@/lib/currency";
import { Badge } from "@/components/ui";
import { phpFetch } from "@/lib/php-client";

export default function AccountOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await phpFetch("orders/get.php");
        if (res.status === 401) {
          navigate("/login");
          return;
        }

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
        return <Badge variant="default">Enviada</Badge>;
      case "delivered":
        return <Badge variant="success">Entregada</Badge>;
      case "cancelled":
        return <Badge variant="error">Cancelada</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
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
