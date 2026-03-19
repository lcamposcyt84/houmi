"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui";
import { RefreshCw, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface PaymentNotification {
  id: string;
  saleId: string | null;
  codigo: string | null;
  mensajeCliente: string | null;
  mensajeSistema: string | null;
  referenciaBancoOrdenante: string | null;
  monto: string | null;
  codigoMoneda: string | null;
  fecha: string | null;
  hora: string | null;
  tipo: string | null;
  createdAt: string;
  sale?: {
    orderNumber: string;
    customerName: string;
  } | null;
}

export default function PaymentsPage() {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/payments");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
    setIsLoading(false);
  };

  const filteredNotifications = notifications.filter((notif) => {
    const search = searchTerm.toLowerCase();
    return (
      notif.referenciaBancoOrdenante?.toLowerCase().includes(search) ||
      notif.sale?.orderNumber.toLowerCase().includes(search) ||
      notif.sale?.customerName.toLowerCase().includes(search) ||
      notif.codigo?.includes(search)
    );
  });

  const getStatusIcon = (codigo: string | null) => {
    if (codigo === "00" || codigo === "0000") {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (codigo && ["51", "52", "53", "54", "55", "56", "57", "58", "59", "61", "99"].includes(codigo)) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusColor = (codigo: string | null) => {
    if (codigo === "00" || codigo === "0000") {
      return "bg-green-50 text-green-800 border-green-200";
    }
    if (codigo && ["51", "52", "53", "54", "55", "56", "57", "58", "59", "61", "99"].includes(codigo)) {
      return "bg-red-50 text-red-800 border-red-200";
    }
    return "bg-yellow-50 text-yellow-800 border-yellow-200";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones de Pago</h1>
          <p className="text-sm text-gray-500 mt-1">
            Confirmaciones recibidas del Banco Mercantil
          </p>
        </div>
        <button
          onClick={fetchNotifications}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Search */}
      <Card>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por referencia, orden o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900/20 focus:border-[#1B3A6D]"
            />
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <div className="p-8 text-center text-gray-500">
              No hay notificaciones de pago
            </div>
          </Card>
        ) : (
          filteredNotifications.map((notif) => (
            <Card key={notif.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(notif.codigo)}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {notif.mensajeCliente || "Notificación de pago"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      notif.codigo
                    )}`}
                  >
                    Código: {notif.codigo || "N/A"}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Referencia Banco</p>
                    <p className="font-medium text-gray-900">
                      {notif.referenciaBancoOrdenante || "N/A"}
                    </p>
                  </div>
                  {notif.sale && (
                    <div>
                      <p className="text-gray-500">Pedido</p>
                      <p className="font-medium text-gray-900">
                        {notif.sale.orderNumber} - {notif.sale.customerName}
                      </p>
                    </div>
                  )}
                  {notif.monto && (
                    <div>
                      <p className="text-gray-500">Monto</p>
                      <p className="font-medium text-gray-900">
                        {notif.monto} {notif.codigoMoneda || ""}
                      </p>
                    </div>
                  )}
                  {notif.fecha && notif.hora && (
                    <div>
                      <p className="text-gray-500">Fecha/Hora Transacción</p>
                      <p className="font-medium text-gray-900">
                        {notif.fecha} {notif.hora}
                      </p>
                    </div>
                  )}
                </div>

                {notif.mensajeSistema && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>Sistema:</strong> {notif.mensajeSistema}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
