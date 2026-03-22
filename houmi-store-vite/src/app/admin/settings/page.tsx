import { SettingsForm } from "./SettingsForm";

export default function AdminSettingsPage() {
  
  
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
