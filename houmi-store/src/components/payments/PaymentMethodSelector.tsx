"use client";

import { CreditCard, Smartphone, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethod {
  id: "c2p" | "debit" | "card";
  name: string;
  description: string;
  icon: React.ReactNode;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "c2p",
    name: "Pago Móvil C2P",
    description: "Pago desde tu móvil",
    icon: <Smartphone className="w-8 h-8" />,
  },
  {
    id: "debit",
    name: "Débito Mercantil",
    description: "Tarjeta de débito Mercantil",
    icon: <Building2 className="w-8 h-8" />,
  },
  {
    id: "card",
    name: "Tarjeta de Crédito",
    description: "Visa o Mastercard",
    icon: <CreditCard className="w-8 h-8" />,
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: "c2p" | "debit" | "card" | null;
  onSelect: (method: "c2p" | "debit" | "card") => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Métodos de Pago</h2>
      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
              "p-4 border-2 rounded-lg transition-all text-left",
              "bg-white/5 backdrop-blur-sm",
              selectedMethod === method.id
                ? "border-[#F7C72C] bg-[#F7C72C]/10 shadow-lg shadow-[#F7C72C]/20"
                : "border-white/20 hover:border-white/40 hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-3 rounded-lg",
                  selectedMethod === method.id
                    ? "bg-[#F7C72C] text-[#1B3A6D]"
                    : "bg-white/10 text-white"
                )}
              >
                {method.icon}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "font-semibold mb-1",
                    selectedMethod === method.id ? "text-[#F7C72C]" : "text-white"
                  )}
                >
                  {method.name}
                </p>
                <p className="text-sm text-white/70">{method.description}</p>
              </div>
              {selectedMethod === method.id && (
                <div className="w-5 h-5 rounded-full bg-[#F7C72C] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#1B3A6D]" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
