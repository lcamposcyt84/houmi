import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { CheckCircle, XCircle, AlertCircle, ShoppingBag } from "lucide-react";
import { formatBs, formatUSD } from "@/lib/currency";
import { phpFetch } from "@/lib/php-client";

import { PaymentMethodSelector } from "@/components/payments/PaymentMethodSelector";
import { C2PPaymentForm } from "@/components/payments/C2PPaymentForm";
import { DebitCardPaymentForm } from "@/components/payments/DebitCardPaymentForm";
import { CreditCardPaymentForm } from "@/components/payments/CreditCardPaymentForm";
import { BdvPaymentForm } from "@/components/payments/BdvPaymentForm";

type PaymentStep = "select" | "form" | "verifying" | "success" | "error";

function PaymentPageContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<PaymentStep>("select");
  const [orderData, setOrderData] = useState<any>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const orderNumber = searchParams.get("order");
    const token = searchParams.get("token");
    const status = searchParams.get("status");

    // BDV: Returning from bank with token — handle first before any redirect
    if (token && status === "verifying" && orderNumber) {
      setStep("verifying");
      phpFetch("payments/bdv_verify.php", {
        method: "POST",
        body: JSON.stringify({ token, orderNumber })
      })
      .then(res => res.json())
      .then(data => {
        if (data.approved) {
          localStorage.removeItem(`order_${orderNumber}`);
          navigate(`/checkout/success?order=${orderNumber}&ref=${data.bankResponse?.reference || token}`);
        } else {
          setErrorMsg(data.error || "El pago fue rechazado por el banco. Puedes volver a intentarlo.");
          setStep("form");
          // Reload order data so the form displays correctly
          const stored = localStorage.getItem(`order_${orderNumber}`);
          if (stored) {
            try { setOrderData(JSON.parse(stored)); } catch (_) {}
          }
        }
      })
      .catch(err => {
        console.error("Error verificando token BDV:", err);
        setErrorMsg("Error al verificar el pago. Intenta de nuevo.");
        setStep("form");
        const stored = localStorage.getItem(`order_${orderNumber}`);
        if (stored) {
          try { setOrderData(JSON.parse(stored)); } catch (_) {}
        }
      });
      return; // Don't continue to localStorage check below
    }

    // Normal flow: load order from localStorage
    const storedOrder = orderNumber ? localStorage.getItem(`order_${orderNumber}`) : null;
    if (storedOrder) {
      try {
        const parsed = JSON.parse(storedOrder);
        setOrderData(parsed);
      } catch (e) {
        console.error("Error parsing order data:", e);
        navigate("/checkout");
      }
    } else {
      navigate("/checkout");
    }

  }, [searchParams]);

  const handleCancel = () => {
     navigate("/checkout");
  };

  const handlePayMercantil = async () => {
    setIsRedirecting(true);
    setErrorMsg("");
    
    try {
      const response = await phpFetch("payments/mercantil_redirect.php", {
        method: "POST",
        body: JSON.stringify({
          orderNumber: orderData.orderNumber
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al conectar con la pasarela");
      }

      if (data.redirectUrl) {
        // Clear order and redirect
        localStorage.removeItem(`order_${orderData.orderNumber}`);
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "No se pudo iniciar la redirección");
      setIsRedirecting(false);
    }
  };

  const handleBdvSuccess = (reference: string) => {
    // Clear order from local storage
    localStorage.removeItem(`order_${orderData.orderNumber}`);
    // Redirect to checkout success page
    navigate(`/checkout/success?order=${orderData.orderNumber}&ref=${reference}`);
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  const { totalVes, totalUsd, orderNumber, paymentMethod } = orderData;
  const merchantName = "DISTRIBUIDORA EL SATELITE EXPRESS C.A."; // Según datos provistos
  const isBdv = paymentMethod === "bdv_pago_movil";

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 font-sans text-gray-800">
      
      {/* HEADER DINÁMICO SEGÚN BANCO */}
      <div className="w-full bg-white md:bg-transparent px-4 md:px-0 pt-6 pb-2 max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
           {isBdv ? (
             <div className="text-[#C8102E] font-bold text-2xl tracking-tight hidden sm:block">
               Banco de Venezuela <span className="text-gray-500 font-medium text-xs align-top">Pago Móvil</span>
             </div>
           ) : (
             <div className="text-[#0072CE] font-bold text-2xl tracking-tight hidden sm:block">
               Mercantil <span className="text-orange-500 font-extrabold text-xs align-top">90 Años</span>
             </div>
           )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-2 md:py-6">
        <div className="max-w-4xl mx-auto">
          
          <h1 className={isBdv ? "text-[#C8102E] text-2xl md:text-3xl font-bold mb-6" : "text-[#0072CE] text-2xl md:text-3xl font-bold mb-6"}>
            Botón de pagos
          </h1>

          {/* Banner Responsabilidad */}
          <div className="bg-[#E9ECEF] text-gray-600 text-sm md:text-base text-center py-3 px-4 rounded-md mb-6 font-medium">
            La entrega del producto o servicio que vas a pagar es responsabilidad del comercio.
          </div>

          <div className="bg-white md:shadow-md md:rounded-xl md:border border-gray-200 overflow-hidden">
            
            <div className="p-6 md:p-10">
              <div className="mb-8">
                <h3 className={isBdv ? "text-[#C8102E] font-bold mb-4" : "text-[#0072CE] font-bold mb-4"}>
                  Datos de la empresa y pedido
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 border border-gray-100 p-6 rounded-lg">
                  <div>
                    <p className={`text-sm font-bold mb-1 ${isBdv ? "text-[#C8102E]" : "text-[#0072CE]"}`}>Empresa</p>
                    <p className="text-sm text-gray-700">{merchantName}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-bold mb-1 ${isBdv ? "text-[#C8102E]" : "text-[#0072CE]"}`}>Orden Nro.</p>
                    <p className="text-sm text-gray-700">{orderNumber}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-bold mb-1 ${isBdv ? "text-[#C8102E]" : "text-[#0072CE]"}`}>Total a Pagar</p>
                    <p className="text-xl font-bold text-gray-900">{formatBs(totalVes)}</p>
                  </div>
                </div>
              </div>

              {step === "verifying" ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Verificando Pago...</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Por favor espera mientras confirmamos tu transacción con el banco. No cierres esta ventana.
                  </p>
                </div>
              ) : isBdv ? (
                /* FLUJO BANCO DE VENEZUELA */
                <BdvPaymentForm 
                  orderNumber={orderNumber}
                  totalUsd={totalUsd}
                  totalVes={totalVes}
                  onBack={handleCancel}
                  onSuccess={handleBdvSuccess}
                />
              ) : (
                /* FLUJO MERCANTIL */
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-50 text-[#0072CE] rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Pago Seguro Mercantil</h2>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Serás redirigido a la plataforma oficial de Mercantil Banco para ingresar tus datos bancarios y completar la transacción de manera segura.
                  </p>

                  {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 max-w-md mx-auto border border-red-200">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button 
                      onClick={handleCancel}
                      disabled={isRedirecting}
                      className="text-gray-500 font-medium hover:text-gray-700 px-6 py-3 transition-colors disabled:opacity-50"
                    >
                      Cancelar orden
                    </button>
                    <button 
                      onClick={handlePayMercantil}
                      disabled={isRedirecting}
                      className="px-10 py-4 bg-[#0072CE] hover:bg-[#005ba3] text-white font-bold rounded-full transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                    >
                      {isRedirecting ? "Generando redirección..." : "Ir a pagar en Mercantil"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-[#0072CE] font-bold text-xl animate-pulse">Cargando pasarela...</div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
