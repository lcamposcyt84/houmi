"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, XCircle } from "lucide-react";
import { PaymentMethodSelector } from "@/components/payments/PaymentMethodSelector";
import { C2PPaymentForm } from "@/components/payments/C2PPaymentForm";
import { DebitCardPaymentForm } from "@/components/payments/DebitCardPaymentForm";
import { CreditCardPaymentForm } from "@/components/payments/CreditCardPaymentForm";
import { formatUSD, formatBs } from "@/lib/currency";

type PaymentMethod = "c2p" | "debit" | "card" | null;
type PaymentStep = "select" | "form" | "success" | "error";

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [step, setStep] = useState<PaymentStep>("select");
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentSimulation, setPaymentSimulation] = useState(false);

  useEffect(() => {
    // Get order data from localStorage or query params
    const orderNumber = searchParams.get("order");
    const storedOrder = orderNumber ? localStorage.getItem(`order_${orderNumber}`) : null;
    
    if (storedOrder) {
      try {
        const parsed = JSON.parse(storedOrder);
        setOrderData(parsed);
      } catch (e) {
        console.error("Error parsing order data:", e);
        router.push("/checkout");
      }
    } else {
      // If no order data, redirect to checkout
      router.push("/checkout");
    }
  }, [searchParams, router]);

  const handleMethodSelect = (method: "c2p" | "debit" | "card") => {
    setPaymentMethod(method);
    setStep("form");
  };

  const handleBack = () => {
    setPaymentMethod(null);
    setStep("select");
  };

  const handlePaymentSuccess = (reference: string, meta?: { simulation?: boolean }) => {
    setPaymentReference(reference);
    setPaymentSimulation(meta?.simulation ?? false);
    setStep("success");
    // Clear order from localStorage
    if (orderData?.orderNumber) {
      localStorage.removeItem(`order_${orderData.orderNumber}`);
    }
  };

  const handlePaymentError = () => {
    setStep("error");
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#1B3A6D] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  const { items, totalUsd, totalVes, orderNumber } = orderData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2444] via-[#1B3A6D] to-[#2A4F8F]">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Payment Forms */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 lg:p-8">
              {step === "select" && (
                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onSelect={handleMethodSelect}
                />
              )}

              {step === "form" && paymentMethod === "c2p" && (
                <C2PPaymentForm
                  orderNumber={orderNumber}
                  totalUsd={totalUsd}
                  totalVes={totalVes}
                  onBack={handleBack}
                  onSuccess={handlePaymentSuccess}
                />
              )}

              {step === "form" && paymentMethod === "debit" && (
                <DebitCardPaymentForm
                  orderNumber={orderNumber}
                  totalUsd={totalUsd}
                  totalVes={totalVes}
                  onBack={handleBack}
                  onSuccess={handlePaymentSuccess}
                />
              )}

              {step === "form" && paymentMethod === "card" && (
                <CreditCardPaymentForm
                  orderNumber={orderNumber}
                  totalUsd={totalUsd}
                  totalVes={totalVes}
                  onBack={handleBack}
                  onSuccess={handlePaymentSuccess}
                />
              )}

              {step === "success" && (
                <div className="text-center py-12">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${paymentSimulation ? "bg-amber-500/20" : "bg-green-500/20"}`}>
                    <CheckCircle className={`w-12 h-12 ${paymentSimulation ? "text-amber-400" : "text-green-400"}`} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {paymentSimulation ? "Solicitud registrada (modo prueba)" : "¡Pago procesado exitosamente!"}
                  </h2>
                  <p className="text-white/70 mb-2">
                    {paymentSimulation
                      ? "No se contactó al banco. Configura la URL de la API en Admin → Configuración para pagos reales."
                      : "Tu pago ha sido confirmado"}
                  </p>
                  {paymentReference && (
                    <p className="text-sm text-[#F7C72C] font-medium mb-6">
                      Referencia: {paymentReference}
                    </p>
                  )}
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 bg-gradient-to-r from-[#F7C72C] to-[#FFD95A] text-[#1B3A6D] font-bold rounded-lg hover:from-[#FFD95A] hover:to-[#F7C72C] transition-all"
                  >
                    Volver al inicio
                  </button>
                </div>
              )}

              {step === "error" && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Error al procesar el pago
                  </h2>
                  <p className="text-white/70 mb-6">
                    Por favor intenta de nuevo o contacta con soporte
                  </p>
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-4">Resumen de Compra</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-6">
                {items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-3 text-sm">
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.quantity} X {item.productName}</p>
                      <p className="text-white/70 text-xs">{item.productCode}</p>
                    </div>
                    <p className="text-white font-semibold">
                      {formatBs(item.priceVes * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-white/20 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Subtotal</span>
                  <span className="text-white">{formatBs(totalVes)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">IVA (16%)</span>
                  <span className="text-white">{formatBs(Math.round(totalVes * 0.16 * 100) / 100)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/20">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-bold text-[#F7C72C] text-lg">
                    {formatBs(Math.round(totalVes * 1.16 * 100) / 100)}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-2">
                  REF {orderNumber}
                </div>
              </div>
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
      <div className="min-h-screen bg-[#1B3A6D] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
