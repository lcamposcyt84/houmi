import { CreditCard, Smartphone, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBs } from "@/lib/currency";

interface PaymentMethod {
  id: "c2p" | "debit" | "card";
  name: string;
  icon: React.ReactNode;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "c2p",
    name: "Pago móvil C2P",
    icon: (
      <div className="relative w-10 h-14 border-2 border-current rounded-[4px] flex flex-col items-center justify-center p-1">
        <div className="w-1.5 h-px bg-current opacity-50 absolute top-1" />
        <span className="font-bold text-sm tracking-tighter leading-none mt-1">Bs</span>
        <span className="text-[10px]">&rarr;</span>
      </div>
    ),
  },
  {
    id: "debit",
    name: "Débito inmediato",
    icon: (
      <div className="relative w-14 h-10 border-2 border-current rounded-[4px] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-current" />
        </div>
      </div>
    ),
  },
  {
    id: "card",
    name: "Pago con tarjetas",
    icon: (
      <div className="relative w-12 h-10">
        {/* Tarjeta trasera */}
        <div className="absolute top-0 right-0 w-10 h-7 border-2 border-current rounded-[3px] bg-white opacity-40"></div>
        {/* Tarjeta frontal */}
        <div className="absolute bottom-0 left-0 w-10 h-7 border-2 border-current rounded-[3px] bg-white">
          <div className="w-full h-1.5 border-b-2 border-current mt-1"></div>
        </div>
      </div>
    ),
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: "c2p" | "debit" | "card" | null;
  onSelect: (method: "c2p" | "debit" | "card") => void;
  merchantName: string;
  totalAmountBg: number;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  merchantName,
  totalAmountBg,
}: PaymentMethodSelectorProps) {
  return (
    <div className="w-full">
      {/* Header del Paso */}
      <div className="px-6 md:px-10 py-6 border-b border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#0072CE] flex items-center justify-center text-[#0072CE] font-bold text-sm">
          1 de 4
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0072CE]">
            Método de pago
          </h2>
          <p className="text-gray-500 text-sm">
            Siguiente paso: Identifícate
          </p>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-8">
        <p className="text-gray-600">
          Inicia el proceso de pago seleccionando el método de pago y luego presiona continuar.
        </p>

        {/* Sección 1: Datos de la empresa */}
        <div>
          <h3 className="text-[#0072CE] font-bold mb-4">1.- Datos de la empresa</h3>
          
          <div className="flex flex-col md:flex-row md:items-end md:gap-24 pl-0 md:pl-4 space-y-4 md:space-y-0">
            <div>
              <p className="text-sm text-[#0072CE] font-bold mb-1">Empresa</p>
              <p className="text-sm text-gray-700">{merchantName}</p>
            </div>
            
            <div>
              <p className="text-sm text-[#0072CE] font-bold mb-1">Monto (Bs.)</p>
              <p className="text-sm text-gray-700">{formatBs(totalAmountBg).replace("Bs ", "")}</p>
            </div>
          </div>
        </div>
        
        {/* Separador sutil */}
        <hr className="border-gray-100" />

        {/* Sección 2: Método de pago */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-[#0072CE] font-bold">2.- Método de pago</h3>
            {/* Tooltip icon simulating the (?) from mockup */}
            <div className="w-5 h-5 rounded-full border border-[#0072CE] text-[#0072CE] flex items-center justify-center text-xs font-bold cursor-help">
              ?
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto md:mx-0 pl-0 md:pl-4">
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod === method.id;
              
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => onSelect(method.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 bg-white border rounded-xl transition-all h-36",
                    isSelected 
                      ? "border-[#0072CE] ring-1 ring-[#0072CE] shadow-sm bg-blue-50/30" 
                      : "border-gray-200 hover:border-[#0072CE] hover:shadow-sm"
                  )}
                >
                  {/* Contenedor del icono con color */}
                  <div className={cn(
                    "mb-4 min-h-[56px] flex items-center justify-center",
                    isSelected ? "text-[#0072CE]" : "text-[#00a3cc]"
                  )}>
                    {method.icon}
                  </div>
                  
                  <span className={cn(
                    "text-sm font-medium text-center leading-tight",
                    isSelected ? "text-[#0072CE]" : "text-gray-600"
                  )}>
                    {method.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
