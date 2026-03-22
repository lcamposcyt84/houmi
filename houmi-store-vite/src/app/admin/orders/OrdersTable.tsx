
import { useState } from "react";
import { Card, Button } from "@/components/ui";
import {
  Search,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  productCode: string;
  quantity: number;
  priceUsd: number;
  priceVes: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  totalUsd: number;
  totalVes: number;
  status: string;
  createdAt: Date;
  items: OrderItem[];
}

interface OrdersTableProps {
  orders: Order[];
  exchangeRate: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-700", icon: Truck },
  completed: { label: "Completado", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: XCircle },
};

export function OrdersTable({ orders, exchangeRate }: OrdersTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone?.includes(search);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWhatsAppLink = (order: Order) => {
    const phone = order.customerPhone?.replace(/\D/g, "") || "";
    const message = encodeURIComponent(
      `¡Hola ${order.customerName}! 👋\n\n` +
      `Gracias por tu pedido en Houmi Store.\n\n` +
      `📦 Pedido: ${order.orderNumber}\n` +
      `💰 Total: $${order.totalUsd.toFixed(2)} (Bs ${order.totalVes.toFixed(2)})\n\n` +
      `¿Cómo te gustaría coordinar el pago y envío?`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-sm text-brand-text-muted">Pendientes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-brand-text-muted">Total Pedidos</p>
          <p className="text-2xl font-bold text-brand-text">{orders.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-brand-text-muted">Total USD</p>
          <p className="text-2xl font-bold text-green-600">
            ${orders.reduce((sum, o) => sum + o.totalUsd, 0).toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-brand-text-muted">Total VES</p>
          <p className="text-2xl font-bold text-brand-primary">
            Bs {orders.reduce((sum, o) => sum + o.totalVes, 0).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por orden, nombre o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmados</option>
            <option value="shipped">Enviados</option>
            <option value="completed">Completados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </Card>

      {/* Orders list */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-brand-text-muted">No hay pedidos</p>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <Card key={order.id} className="overflow-hidden">
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-brand-text text-lg">
                          {order.orderNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-brand-text-muted mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.customerPhone && (
                        <a
                          href={getWhatsAppLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="accent"
                            size="sm"
                            leftIcon={<MessageCircle className="w-4 h-4" />}
                          >
                            WhatsApp
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        leftIcon={<Eye className="w-4 h-4" />}
                      >
                        {selectedOrder?.id === order.id ? "Ocultar" : "Ver detalles"}
                      </Button>
                    </div>
                  </div>

                  {/* Customer info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-1.5 bg-gray-100 rounded">
                        <Phone className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-brand-text">{order.customerName}</p>
                        <p className="text-brand-text-muted">{order.customerPhone || "Sin teléfono"}</p>
                      </div>
                    </div>
                    {order.customerEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 bg-gray-100 rounded">
                          <Mail className="w-4 h-4 text-gray-600" />
                        </div>
                        <p className="text-brand-text-muted truncate">{order.customerEmail}</p>
                      </div>
                    )}
                    {order.customerAddress && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 bg-gray-100 rounded">
                          <MapPin className="w-4 h-4 text-gray-600" />
                        </div>
                        <p className="text-brand-text-muted truncate">{order.customerAddress}</p>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-sm text-brand-text-muted">
                        {order.items.length} producto(s)
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-brand-text">
                        ${order.totalUsd.toFixed(2)}
                      </p>
                      <p className="text-sm text-brand-text-muted">
                        Bs {order.totalVes.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {selectedOrder?.id === order.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {/* Products */}
                      <div>
                        <h4 className="font-medium text-brand-text mb-2">Productos</h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <div>
                                <span className="font-medium">{item.productName}</span>
                                <span className="text-brand-text-muted ml-2">
                                  ({item.productCode}) × {item.quantity}
                                </span>
                              </div>
                              <span className="font-medium">
                                ${(item.priceUsd * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status change */}
                      <div>
                        <h4 className="font-medium text-brand-text mb-2">Cambiar estado</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <button
                              key={key}
                              onClick={() => handleStatusChange(order.id, key)}
                              disabled={order.status === key}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                order.status === key
                                  ? config.color + " cursor-not-allowed"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {config.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
