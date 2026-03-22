
import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { ArrowLeft, Loader2 } from "lucide-react";

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
  { code: "0412", name: "Movistar" },
  { code: "0414", name: "Movistar" },
  { code: "0416", name: "Movistar" },
  { code: "0424", name: "Movistar" },
  { code: "0426", name: "Movistar" },
  { code: "0412", name: "Digitel" },
  { code: "0416", name: "Digitel" },
  { code: "0426", name: "Digitel" },
  { code: "0424", name: "Movilnet" },
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
      const response = await fetch("/api/payments/c2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div>
        <h2 className="text-xl font-bold text-white mb-2">Métodos de Pago</h2>
        <p className="text-sm text-white/70">Completa los datos para pagar con Pago Móvil C2P</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cédula de Identidad */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Cédula de identidad
          </label>
          <div className="flex gap-2">
            <select
              value={formData.idType}
              onChange={(e) => handleChange("idType", e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7C72C] focus:border-[#F7C72C]"
            >
              <option value="V" className="bg-[#1B3A6D]">V</option>
              <option value="E" className="bg-[#1B3A6D]">E</option>
              <option value="J" className="bg-[#1B3A6D]">J</option>
            </select>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => handleChange("idNumber", e.target.value.replace(/\D/g, ""))}
              placeholder="23534481"
              maxLength={9}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F7C72C] focus:border-[#F7C72C]"
            />
          </div>
          {errors.idNumber && (
            <p className="mt-1 text-sm text-red-400">{errors.idNumber}</p>
          )}
        </div>

        {/* Banco */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Banco
          </label>
          <select
            value={formData.bank}
            onChange={(e) => handleChange("bank", e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7C72C] focus:border-[#F7C72C]"
          >
            <option value="" className="bg-[#1B3A6D]">Selecciona un banco</option>
            {venezuelanBanks.map((bank) => (
              <option key={bank.code} value={bank.code} className="bg-[#1B3A6D]">
                {bank.name}
              </option>
            ))}
          </select>
          {errors.bank && (
            <p className="mt-1 text-sm text-red-400">{errors.bank}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Teléfono
          </label>
          <div className="flex gap-2">
            <select
              value={formData.phoneCarrier}
              onChange={(e) => handleChange("phoneCarrier", e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7C72C] focus:border-[#F7C72C]"
            >
              {phoneCarriers.map((carrier) => (
                <option key={carrier.code} value={carrier.code} className="bg-[#1B3A6D]">
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
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F7C72C] focus:border-[#F7C72C]"
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-400">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Código C2P */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Código C2P
          </label>
          <input
            type="text"
            value={formData.c2pCode}
            onChange={(e) => handleChange("c2pCode", e.target.value.replace(/\D/g, ""))}
            placeholder="12345678"
            maxLength={8}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F7C72C] focus:border-[#F7C72C]"
          />
          {errors.c2pCode && (
            <p className="mt-1 text-sm text-red-400">{errors.c2pCode}</p>
          )}
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
