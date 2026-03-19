import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { BulkPricingForm } from "./BulkPricingForm";

export default async function BulkPricingPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

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





