
import { useState } from "react";
import { ArrowLeft, Loader2, Lock } from "lucide-react";

interface DebitCardPaymentFormProps {
  orderNumber: string;
  totalUsd: number;
  totalVes: number;
  onBack: () => void;
  onSuccess: (reference: string) => void;
}

export function DebitCardPaymentForm({
  orderNumber,
  totalUsd,
  totalVes,
  onBack,
  onSuccess,
}: DebitCardPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    idNumber: "",
  });

  const handleChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === "cardNumber") {
      processedValue = value.replace(/\D/g, "").slice(0, 16);
      // Add spaces every 4 digits
      processedValue = processedValue.match(/.{1,4}/g)?.join(" ") || processedValue;
    } else if (field === "cvv") {
      processedValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (field === "idNumber") {
      processedValue = value.replace(/\D/g, "").slice(0, 9);
    } else if (field === "expiryMonth" || field === "expiryYear") {
      processedValue = value.replace(/\D/g, "").slice(0, field === "expiryMonth" ? 2 : 2);
    }
    
    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const cardNumberClean = formData.cardNumber.replace(/\s/g, "");
    if (!cardNumberClean || cardNumberClean.length < 16) {
      newErrors.cardNumber = "Número de tarjeta inválido";
    }

    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = "Nombre del titular es requerido";
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiry = "Fecha de vencimiento requerida";
    } else {
      const month = parseInt(formData.expiryMonth);
      const year = parseInt("20" + formData.expiryYear);
      const expiryDate = new Date(year, month - 1);
      const now = new Date();
      if (expiryDate < now) {
        newErrors.expiry = "Tarjeta vencida";
      }
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = "CVV inválido";
    }

    if (!formData.idNumber || formData.idNumber.length < 6) {
      newErrors.idNumber = "Cédula requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const cardNumberClean = formData.cardNumber.replace(/\s/g, "");
      
      const response = await fetch("/api/payments/debit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          cardNumber: cardNumberClean,
          cardHolder: formData.cardHolder,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          cvv: formData.cvv,
          idNumber: formData.idNumber,
          amount: totalVes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el pago");
      }

      onSuccess(data.reference || "Pago procesado");
    } catch (error: any) {
      console.error("Error processing debit payment:", error);
      setErrors({ general: error.message || "Error al procesar el pago" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div>
        <h2 className="text-xl font-bold text-white mb-2">Métodos de Pago</h2>
        <p className="text-sm text-white/70">Completa los datos de tu tarjeta de débito</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Número de tarjeta
          </label>
          <input
            type="text"
            value={formData.cardNumber}
            onChange={(e) => handleChange("cardNumber", e.target.value)}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F7C72C] focus:border-[#F7C72C]"
          />
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-400">{errors.cardNumber}</p>
          )}
        </div>

        {/* Card Holder */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Nombre del titular
          </label>
          <input
            type="text"
            value={formData.cardHolder}
            onChange={(e) => handleChange("cardHolder", e.target.value.toUpperCase())}
            placeholder="JUAN PEREZ"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F7C72C] focus:border-[#F7C72C]"
          />
          {errors.cardHolder && (
            <p className="mt-1 text-sm text-red-400">{errors.cardHolder}</p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Vencimiento
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.expiryMonth}
                onChange={(e) => handleChange("expiryMonth", e.target.value)}
                placeholder="MM"
                maxLength={2}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F7C72C] focus:border-[#F7C72C]"
              />
              <input
                type="text"
                value={formData.expiryYear}
                onChange={(e) => handleChange("expiryYear", e.target.value)}
                placeholder="YY"
                maxLength={2}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F7C72C] focus:border-[#F7C72C]"
              />
            </div>
            {errors.expiry && (
              <p className="mt-1 text-sm text-red-400">{errors.expiry}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              CVV
            </label>
            <input
              type="text"
              value={formData.cvv}
              onChange={(e) => handleChange("cvv", e.target.value)}
              placeholder="123"
              maxLength={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F7C72C] focus:border-[#F7C72C]"
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-400">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* ID Number */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Cédula de identidad
          </label>
          <input
            type="text"
            value={formData.idNumber}
            onChange={(e) => handleChange("idNumber", e.target.value)}
            placeholder="12345678"
            maxLength={9}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F7C72C] focus:border-[#F7C72C]"
          />
          {errors.idNumber && (
            <p className="mt-1 text-sm text-red-400">{errors.idNumber}</p>
          )}
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
          <Lock className="w-5 h-5 text-[#F7C72C] shrink-0 mt-0.5" />
          <p className="text-xs text-white/70">
            Tus datos están protegidos con encriptación SSL. No almacenamos información de tu tarjeta.
          </p>
        </div>

        {errors.general && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-400">{errors.general}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-[#F7C72C] to-[#FFD95A] text-[#1B3A6D] font-bold rounded-lg hover:from-[#FFD95A] hover:to-[#F7C72C] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando...
            </>
          ) : (
            "Pagar"
          )}
        </button>
      </form>
    </div>
  );
}
