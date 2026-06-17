import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { ArrowLeft, Loader2 } from "lucide-react";
import { phpFetch } from "@/lib/php-client";

interface C2PPaymentFormProps {
  orderNumber: string;
  totalUsd: number;
  totalVes: number;
  onBack: () => void;
  onSuccess: (reference: string, meta?: { simulation?: boolean }) => void;
}

const venezuelanBanks = [
  { code: "0102", name: "Banco de Venezuela" },
  { code: "0104", name: "Venezolano de Crédito" },
  { code: "0105", name: "Mercantil" },
  { code: "0108", name: "Banco Provincial" },
  { code: "0114", name: "Bancaribe" },
  { code: "0115", name: "Banco Exterior" },
  { code: "0128", name: "Banco Caroní" },
  { code: "0134", name: "Banesco" },
  { code: "0137", name: "Banco Sofitasa" },
  { code: "0138", name: "Banco Plaza" },
  { code: "0146", name: "Banco de la Gente Emprendedora" },
  { code: "0151", name: "BFC Banco Fondo Común" },
  { code: "0156", name: "100% Banco" },
  { code: "0157", name: "DelSur" },
  { code: "0163", name: "Banco del Tesoro" },
  { code: "0166", name: "Banco Agrícola" },
  { code: "0168", name: "Bancrecer" },
  { code: "0169", name: "Mi Banco" },
  { code: "0171", name: "Banco Activo" },
  { code: "0172", name: "Bancamiga" },
  { code: "0174", name: "Banplus" },
  { code: "0175", name: "Bicentenario del Pueblo" },
];

const phoneCarriers = [
  { code: "0412", name: "Movistar / Digitel" },
  { code: "0414", name: "Movistar" },
  { code: "0416", name: "Movilnet" },
  { code: "0424", name: "Movistar" },
  { code: "0426", name: "Movilnet" },
];

export function C2PPaymentForm({
  orderNumber,
  totalUsd,
  totalVes,
  onBack,
  onSuccess,
}: C2PPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    idType: "V",
    idNumber: "",
    bank: "",
    phoneCarrier: "0412",
    phoneNumber: "",
    c2pCode: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "El número de cédula es requerido";
    } else if (!/^\d{6,9}$/.test(formData.idNumber)) {
      newErrors.idNumber = "Cédula inválida";
    }

    if (!formData.bank) {
      newErrors.bank = "Debes seleccionar un banco";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "El número de teléfono es requerido";
    } else if (!/^\d{7}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Teléfono inválido (7 dígitos)";
    }

    if (!formData.c2pCode.trim()) {
      newErrors.c2pCode = "El código C2P es requerido";
    } else if (!/^\d{8}$/.test(formData.c2pCode)) {
      newErrors.c2pCode = "Código C2P inválido (8 dígitos)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await phpFetch("payments/mercantil_direct.php", {
        method: "POST",
        body: JSON.stringify({
          methodType: "c2p",
          orderNumber,
          idType: formData.idType,
          idNumber: formData.idNumber,
          bank: formData.bank,
          phone: `${formData.phoneCarrier}${formData.phoneNumber}`,
          c2pCode: formData.c2pCode,
          amount: totalVes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el pago");
      }

      onSuccess(data.reference || "Pago procesado", { simulation: data.simulation });
    } catch (error: any) {
      console.error("Error processing C2P payment:", error);
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
        {/* Cédula de Identidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cédula de identidad *
          </label>
          <div className="flex gap-2">
            <select
              value={formData.idType}
              onChange={(e) => handleChange("idType", e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-[#0072CE]"
            >
              <option value="V">V</option>
              <option value="E">E</option>
              <option value="J">J</option>
            </select>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => handleChange("idNumber", e.target.value.replace(/\D/g, ""))}
              placeholder="23534481"
              maxLength={9}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-[#0072CE]"
            />
          </div>
          {errors.idNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.idNumber}</p>
          )}
        </div>

        {/* Banco */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banco *
          </label>
          <select
            value={formData.bank}
            onChange={(e) => handleChange("bank", e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-[#0072CE]"
          >
            <option value="">Selecciona un banco</option>
            {venezuelanBanks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
          {errors.bank && (
            <p className="mt-1 text-sm text-red-500">{errors.bank}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <div className="flex gap-2">
            <select
              value={formData.phoneCarrier}
              onChange={(e) => handleChange("phoneCarrier", e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-[#0072CE]"
            >
              {phoneCarriers.map((carrier) => (
                <option key={carrier.code} value={carrier.code}>
                  {carrier.code}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value.replace(/\D/g, ""))}
              placeholder="1234567"
              maxLength={7}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-[#0072CE]"
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Código C2P */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clave de pago (Código C2P) *
          </label>
          <input
            type="text"
            value={formData.c2pCode}
            onChange={(e) => handleChange("c2pCode", e.target.value.replace(/\D/g, ""))}
            placeholder="12345678"
            maxLength={8}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-[#0072CE]"
          />
          {errors.c2pCode && (
            <p className="mt-1 text-sm text-red-500">{errors.c2pCode}</p>
          )}
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
