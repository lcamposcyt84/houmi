import { useState } from "react";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { phpFetch } from "@/lib/php-client";

interface CreditCardPaymentFormProps {
  orderNumber: string;
  totalUsd: number;
  totalVes: number;
  onBack: () => void;
  onSuccess: (reference: string) => void;
}

export function CreditCardPaymentForm({
  orderNumber,
  totalUsd,
  totalVes,
  onBack,
  onSuccess,
}: CreditCardPaymentFormProps) {
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
      
      const response = await phpFetch("payments/mercantil_direct.php", {
        method: "POST",
        body: JSON.stringify({
          methodType: "card",
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
      console.error("Error processing credit payment:", error);
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
        className="flex items-center gap-2 text-[#0072CE] hover:underline transition-colors text-sm font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la selección de métodos
      </button>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de tarjeta *
          </label>
          <input
            type="text"
            value={formData.cardNumber}
            onChange={(e) => handleChange("cardNumber", e.target.value)}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-[#0072CE]"
          />
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
          )}
        </div>

        {/* Card Holder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre impreso en la tarjeta *
          </label>
          <input
            type="text"
            value={formData.cardHolder}
            onChange={(e) => handleChange("cardHolder", e.target.value.toUpperCase())}
            placeholder="JUAN PEREZ"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-[#0072CE]"
          />
          {errors.cardHolder && (
            <p className="mt-1 text-sm text-red-500">{errors.cardHolder}</p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de vencimiento *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.expiryMonth}
                onChange={(e) => handleChange("expiryMonth", e.target.value)}
                placeholder="MM"
                maxLength={2}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-[#0072CE] text-center"
              />
              <span className="flex items-center text-gray-400">/</span>
              <input
                type="text"
                value={formData.expiryYear}
                onChange={(e) => handleChange("expiryYear", e.target.value)}
                placeholder="YY"
                maxLength={2}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-[#0072CE] text-center"
              />
            </div>
            {errors.expiry && (
              <p className="mt-1 text-sm text-red-500">{errors.expiry}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código CVV *
            </label>
            <input
              type="text"
              value={formData.cvv}
              onChange={(e) => handleChange("cvv", e.target.value)}
              placeholder="123"
              maxLength={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-[#0072CE]"
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* ID Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cédula de identidad titular *
          </label>
          <input
            type="text"
            value={formData.idNumber}
            onChange={(e) => handleChange("idNumber", e.target.value.replace(/\D/g, ""))}
            placeholder="12345678"
            maxLength={9}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-[#0072CE]"
          />
          {errors.idNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.idNumber}</p>
          )}
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <Lock className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            Tus datos están protegidos con encriptación SSL. No almacenamos información de tu tarjeta.
          </p>
        </div>

        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <div className="pt-4 mt-8 border-t border-gray-100 flex justify-end">
           <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3 bg-[#0072CE] hover:bg-[#005ba3] text-white font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando
              </>
            ) : (
              "Pagar"
            )}
           </button>
        </div>
      </form>
    </div>
  );
}
