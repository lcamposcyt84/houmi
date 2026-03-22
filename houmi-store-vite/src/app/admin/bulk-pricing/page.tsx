import { BulkPricingForm } from "./BulkPricingForm";

export default function BulkPricingPage() {
  
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Actualización de precios en lote</h1>
        <p className="text-gray-600 mt-1">
          Aplica cambios de precio porcentuales a múltiples productos
        </p>
      </div>
      <BulkPricingForm />
    </div>
  );
}
