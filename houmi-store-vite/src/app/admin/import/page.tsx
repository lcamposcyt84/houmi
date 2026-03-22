import { ImportExcelForm } from "./ImportExcelForm";


export default function ImportPage() {
  
  
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
