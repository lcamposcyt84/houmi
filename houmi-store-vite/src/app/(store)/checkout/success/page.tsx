import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ShoppingBag } from "lucide-react";
import { phpFetch } from "@/lib/php-client";

function CheckoutSuccessContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "approved" | "rejected" | "pending">("pending");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [bankMessage, setBankMessage] = useState<string>("");

  useEffect(() => {
    const transactiondata = searchParams.get("transactiondata");
    const orderParam = searchParams.get("order");

    if (orderParam) {
      setOrderNumber(orderParam);
    }

    if (transactiondata) {
      // Caso: Banco Mercantil redirigió al cliente con transactiondata en la URL
      setStatus("loading");

      phpFetch("payments/mercantil_verify.php", {
        method: "POST",
        body: JSON.stringify({ transactiondata }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.approved) {
            setStatus("approved");
            if (data.orderNumber) setOrderNumber(data.orderNumber);
          } else {
            setStatus("rejected");
            setBankMessage(data.bankResponse?.responseMessage || "La transacción fue rechazada por el banco.");
          }
        })
        .catch(() => {
          setStatus("rejected");
          setBankMessage("Error al verificar la transacción. Contacta al soporte.");
        });
    } else {
      // Llegó acá sin transactiondata: puede venir de un pago manual exitoso (de antes)
      setStatus("approved");
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 p-6">
        <Loader2 className="w-16 h-16 text-[#0072CE] animate-spin" />
        <h2 className="text-2xl font-bold text-gray-700">Verificando tu pago...</h2>
        <p className="text-gray-500 text-center max-w-sm">
          Estamos confirmando la transacción con Mercantil Banco. Esto tomará solo unos segundos.
        </p>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 p-6">
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="w-14 h-14 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Pago No Procesado</h1>
        <p className="text-gray-600 text-center max-w-md">
          {bankMessage || "Tu pago no pudo ser procesado. Puedes intentarlo de nuevo o usar otro método de pago."}
        </p>
        {orderNumber && (
          <p className="text-sm text-gray-400">Referencia de orden: #{orderNumber}</p>
        )}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => navigate(`/checkout/payment?order=${orderNumber}`)}
            className="px-8 py-3 bg-[#0072CE] hover:bg-[#005ba3] text-white font-bold rounded-full transition-all shadow-md"
          >
            Intentar de nuevo
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-full transition-all"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  // Status: approved o pending (directo)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 p-6">
      <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center shadow-lg shadow-green-200/50">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">¡Pago Exitoso!</h1>
        <p className="text-gray-500 text-lg">Tu pedido ha sido confirmado.</p>
        {orderNumber && (
          <p className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full inline-block mt-2">
            Orden: #{orderNumber}
          </p>
        )}
      </div>

      <div className="max-w-sm w-full bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 text-green-600">
          <ShoppingBag className="w-5 h-5" />
          <span className="font-semibold text-sm">Compra procesada correctamente</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Hemos recibido tu pago con Mercantil Banco. Recibirás una confirmación pronto y tu pedido
          será preparado para despacho.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          onClick={() => navigate("/account/orders")}
          className="px-8 py-3 bg-[#0072CE] hover:bg-[#005ba3] text-white font-bold rounded-full transition-all shadow-md shadow-blue-500/20"
        >
          Ver mis pedidos
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-full transition-all"
        >
          Seguir comprando
        </button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#0072CE]" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
