import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Gestiona la configuración general de la tienda
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}





