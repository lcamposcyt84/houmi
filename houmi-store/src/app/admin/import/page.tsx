import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { ImportExcelForm } from "./ImportExcelForm";

export const metadata: Metadata = {
  title: "Importar Excel | Admin",
  description: "Importar y actualizar productos desde Excel",
};

export default async function ImportPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">
          Importar desde Excel
        </h1>
        <p className="text-brand-text-muted">
          Actualiza productos en lote usando un archivo Excel
        </p>
      </div>

      <ImportExcelForm />
    </div>
  );
}
