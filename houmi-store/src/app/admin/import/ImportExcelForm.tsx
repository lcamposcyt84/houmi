"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Info,
} from "lucide-react";
import { Card, Button } from "@/components/ui";

interface ImportResults {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export function ImportExcelForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFixingSlugs, setIsFixingSlugs] = useState(false);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de archivo
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.endsWith('.xlsx') && 
          !selectedFile.name.endsWith('.xls') &&
          !selectedFile.name.endsWith('.csv')) {
        setError("Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV");
        return;
      }
      setFile(selectedFile);
      setError("");
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Selecciona un archivo primero");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/import-excel", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al importar");
      }

      setResults(data.results);
      setSuccess(data.message);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/admin/import-excel");
      
      if (!response.ok) {
        throw new Error("Error al descargar plantilla");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `productos_houmi_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al descargar");
    }
  };

  const handleFixSlugs = async () => {
    setIsFixingSlugs(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/fix-slugs", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al corregir slugs");
      }

      setSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al corregir slugs");
    } finally {
      setIsFixingSlugs(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main upload area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle className="w-5 h-5 shrink-0" />
            {success}
          </div>
        )}

        {/* Upload Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Subir archivo Excel
          </h2>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              file
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-brand-primary"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file"
            />
            <label htmlFor="excel-file" className="cursor-pointer">
              {file ? (
                <div className="flex flex-col items-center">
                  <FileSpreadsheet className="w-12 h-12 text-green-600 mb-3" />
                  <p className="font-medium text-green-700">{file.name}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Haz clic para cambiar archivo
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="font-medium text-gray-700">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Formatos: .xlsx, .xls, .csv
                  </p>
                </div>
              )}
            </label>
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!file || isUploading}
              isLoading={isUploading}
              leftIcon={<Upload className="w-4 h-4" />}
              className="flex-1"
            >
              {isUploading ? "Procesando..." : "Importar datos"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Descargar plantilla
            </Button>
          </div>
        </Card>

        {/* Results */}
        {results && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Resultados</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {results.created}
                </p>
                <p className="text-sm text-green-700">Creados</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {results.updated}
                </p>
                <p className="text-sm text-blue-700">Actualizados</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {results.skipped}
                </p>
                <p className="text-sm text-yellow-700">Omitidos</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-red-600 mb-2">
                  Errores ({results.errors.length}):
                </p>
                <div className="bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {results.errors.map((err, i) => (
                    <p key={i} className="text-sm text-red-700">
                      {err}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Fix Slugs */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Corregir URLs de productos
          </h2>
          <p className="text-brand-text-muted text-sm mb-4">
            Si algunos productos no se muestran correctamente en la tienda, 
            usa este botón para regenerar las URLs (slugs) de todos los productos.
          </p>
          <Button
            variant="outline"
            onClick={handleFixSlugs}
            isLoading={isFixingSlugs}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            {isFixingSlugs ? "Corrigiendo..." : "Corregir URLs"}
          </Button>
        </Card>
      </div>

      {/* Instructions sidebar */}
      <div>
        <Card className="p-6 sticky top-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Instrucciones
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-brand-text mb-1">
                Columnas del Excel
              </h3>
              <ul className="text-brand-text-muted space-y-1">
                <li>• <strong>CODIGO</strong> - Código único del producto (requerido)</li>
                <li>• <strong>NOMBRE</strong> - Nombre del producto</li>
                <li>• <strong>DESCRIPCION</strong> - Descripción</li>
                <li>• <strong>CATEGORIA</strong> - Nombre de la categoría</li>
                <li>• <strong>STOCK</strong> - Cantidad en inventario</li>
                <li>• <strong>PRECIO_USD</strong> - Precio en dólares</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-brand-text mb-1">
                ¿Cómo funciona?
              </h3>
              <ul className="text-brand-text-muted space-y-1">
                <li>1. Descarga la plantilla con los productos actuales</li>
                <li>2. Modifica los valores que necesites</li>
                <li>3. Sube el archivo modificado</li>
                <li>4. Los productos se actualizan por código</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-brand-text mb-1">
                Notas importantes
              </h3>
              <ul className="text-brand-text-muted space-y-1">
                <li>• El <strong>CODIGO</strong> es la llave para identificar productos</li>
                <li>• Solo se actualizan los campos con valor</li>
                <li>• Los productos nuevos necesitan categoría</li>
                <li>• El precio VES se calcula automáticamente</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-brand-text mb-1">
                Categorías disponibles
              </h3>
              <p className="text-brand-text-muted text-xs">
                TV, Bicicletas, Cámaras, Carro, Consolas de Videojuegos, 
                Cornetas, Electrodomésticos, Micrófono y Ecualizador
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
