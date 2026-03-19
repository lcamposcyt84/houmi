import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { ProductsTable } from "./ProductsTable";

export default async function AdminProductsPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <p className="text-gray-600 mt-1">
          Gestiona el inventario, precios y estado de tus productos
        </p>
      </div>
      <ProductsTable />
    </div>
  );
}





