import { useState } from "react";
import { ArrowLeft, Loader2, CreditCard, ShieldCheck, AlertCircle } from "lucide-react";
import { phpFetch } from "@/lib/php-client";

interface BdvPaymentFormProps {
  orderNumber: string;
  totalUsd: number;
  totalVes: number;
  onBack: () => void;
  onSuccess: (reference: string) => void;
}

export function BdvPaymentForm({
  orderNumber,
  onBack,
}: BdvPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [idType, setIdType] = useState("V");
  const [idNumber, setIdNumber] = useState("");

  const handleBdvRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber.trim() || idNumber.length < 6) {
      setErrorMsg("Por favor, ingresa un número de cédula/RIF válido.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await phpFetch("payments/bdv_button.php", {
        method: "POST",
        body: JSON.stringify({ 
          orderNumber,
          idLetter: idType,
          idNumber: idNumber.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al conectar con el Banco de Venezuela");
      }

      if (data.paymentUrl) {
        // Redirigir directamente a la URL de pago provista por la clase IPG BDV
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "No se pudo iniciar la redirección al banco");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-red-50 text-[#C8102E] rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldCheck size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Botón de Pago BDV</h2>
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        Serás redirigido a la pasarela segura del Banco de Venezuela para autorizar el débito en tu cuenta.
      </p>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 max-w-md mx-auto border border-red-200 flex items-start gap-2 text-left">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-sm">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleBdvRedirect} className="max-w-xs mx-auto mb-8 text-left">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cédula / RIF del titular de la cuenta
        </label>
        <div className="flex gap-2">
          <select
            value={idType}
            onChange={(e) => setIdType(e.target.value)}
            className="px-3 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C8102E] transition-colors"
          >
            <option value="V">V</option>
            <option value="E">E</option>
            <option value="J">J</option>
            <option value="P">P</option>
            <option value="G">G</option>
          </select>
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ""))}
            placeholder="12345678"
            maxLength={10}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E] transition-colors"
            required
          />
        </div>
      </form>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-gray-500 font-medium hover:text-gray-700 px-6 py-3 transition-colors disabled:opacity-50"
        >
          Cancelar orden
        </button>
        <button
          onClick={handleBdvRedirect}
          disabled={isSubmitting}
          className="px-10 py-4 bg-[#C8102E] hover:bg-[#a00d25] text-white font-bold rounded-full transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-red-500/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Conectando con BDV...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Ir a pagar en BDV
            </>
          )}
        </button>
      </div>
    </div>
  );
}
