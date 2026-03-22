
import { useState, useEffect } from "react";
import { Save, RefreshCw, Check, DollarSign } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import type { Settings } from "@/types";

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [exchangeRate, setExchangeRate] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [mercantilApiUrl, setMercantilApiUrl] = useState("");
  const [mercantilApiPath, setMercantilApiPath] = useState("");
  const [mercantilApiKey, setMercantilApiKey] = useState("");
  const [mercantilApiSecret, setMercantilApiSecret] = useState("");
  const [mercantilMasterKey, setMercantilMasterKey] = useState("");
  const [mercantilIdComercio, setMercantilIdComercio] = useState("");
  const [mercantilWebhookUrl, setMercantilWebhookUrl] = useState("");
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; detail?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (response.ok) {
        setSettings(data);
        setExchangeRate(data.exchangeRateUsdToVes.toString());
        setStoreName(data.storeName);
        setStoreDescription(data.storeDescription || "");
        setWhatsappNumber(data.whatsappNumber || "");
        setMercantilApiUrl(data.mercantilApiUrl || "");
        setMercantilApiPath(data.mercantilApiPath || "");
        setMercantilApiKey(data.mercantilApiKey || "");
        setMercantilApiSecret(data.mercantilApiSecret || "");
        setMercantilMasterKey(data.mercantilMasterKey || "");
        setMercantilIdComercio(data.mercantilIdComercio || "");
        setMercantilWebhookUrl(data.mercantilWebhookUrl || "");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError("Error al cargar configuración");
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exchangeRateUsdToVes: parseFloat(exchangeRate),
          storeName,
          storeDescription,
          whatsappNumber,
          mercantilApiUrl,
          mercantilApiPath,
          mercantilApiKey,
          mercantilApiSecret,
          mercantilMasterKey,
          mercantilIdComercio,
          mercantilWebhookUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Error al guardar");
      }
    } catch {
      setError("Error de conexión");
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
        </div>
      </Card>
    );
  }

  const rate = parseFloat(exchangeRate) || 0;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Exchange Rate */}
      <Card>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Tasa de cambio
              </h2>
              <p className="text-sm text-gray-500">USD a Bolívares (VES)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              1 USD equivale a:
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-full pl-4 pr-16 py-3 text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900/20 focus:border-[#1B3A6D]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                Bs
              </span>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <p className="text-sm font-medium text-gray-700">Vista previa:</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">$10.00 =</span>
                <span className="ml-2 font-semibold">Bs {(10 * rate).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">$50.00 =</span>
                <span className="ml-2 font-semibold">Bs {(50 * rate).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">$100.00 =</span>
                <span className="ml-2 font-semibold">Bs {(100 * rate).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">$500.00 =</span>
                <span className="ml-2 font-semibold">Bs {(500 * rate).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {settings && (
            <p className="text-xs text-gray-500">
              Última actualización: {formatDateTime(settings.updatedAt)}
            </p>
          )}
        </div>
      </Card>

      {/* Store Info */}
      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Información de la tienda
          </h2>

          <Input
            label="Nombre de la tienda"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Houmi Store"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción
            </label>
            <textarea
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              placeholder="Tu tienda de confianza..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900/20 focus:border-[#1B3A6D]"
            />
          </div>

          <Input
            label="Número de WhatsApp"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="584249480518"
            type="tel"
          />
        </div>
      </Card>

      {/* Banco Mercantil Configuration */}
      <Card>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-400/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Banco Mercantil
              </h2>
              <p className="text-sm text-gray-500">Configuración de pagos (C2P, débito)</p>
            </div>
          </div>

          <Input
            label="URL de la API del banco"
            value={mercantilApiUrl}
            onChange={(e) => setMercantilApiUrl(e.target.value)}
            placeholder="https://gw.3be3-22336bfa.us-east.apiconnect.appdomain.cloud/mercantil-banco/prod/v1/payment"
            type="url"
          />
          <p className="text-xs text-gray-500 -mt-2">
            Si apimbu da 404, prueba la pasarela IBM: https://gw.3be3-22336bfa.us-east.apiconnect.appdomain.cloud/mercantil-banco/prod/v1/payment
          </p>
          <p className="text-xs text-amber-600 -mt-1">
            Si ambas dan 404, pide al banco la URL exacta al activar tu app (apisupport@mercantilbanco.com).
          </p>

          <Input
            label="Ruta del endpoint C2P (opcional)"
            value={mercantilApiPath}
            onChange={(e) => setMercantilApiPath(e.target.value)}
            placeholder="/api (según doc; si 404 prueba vacío)"
          />
          <p className="text-xs text-gray-500 -mt-2">
            Si el banco devuelve 404, prueba dejarlo vacío o otra ruta (ej. /c2p, /payment). Por defecto usamos /api.
          </p>

          <Input
            label="Clave API (API Key)"
            value={mercantilApiKey}
            onChange={(e) => setMercantilApiKey(e.target.value)}
            placeholder="fe56cd2339d31fabc58f117f0656e0bb"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Secreto API (API Secret)
            </label>
            <div className="relative">
              <input
                type={showApiSecret ? "text" : "password"}
                value={mercantilApiSecret}
                onChange={(e) => setMercantilApiSecret(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900/20 focus:border-[#1B3A6D]"
              />
              <button
                type="button"
                onClick={() => setShowApiSecret(!showApiSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
              >
                {showApiSecret ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              El secreto se muestra una sola vez al generarlo en el banco. Guárdalo aquí para C2P y pagos.
            </p>
          </div>

          <Input
            label="ID Comercio"
            value={mercantilIdComercio}
            onChange={(e) => setMercantilIdComercio(e.target.value)}
            placeholder="J000000406848786"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Master Key (Clave Privada RSA)
            </label>
            <div className="relative">
              <textarea
                value={mercantilMasterKey}
                onChange={(e) => setMercantilMasterKey(e.target.value)}
                placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                rows={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900/20 focus:border-[#1B3A6D] font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowMasterKey(!showMasterKey)}
                className="absolute top-2 right-2 text-xs text-gray-500 hover:text-gray-700"
              >
                {showMasterKey ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Clave privada RSA proporcionada por el banco para descifrar mensajes
            </p>
          </div>

          <Input
            label="URL del Webhook"
            value={mercantilWebhookUrl}
            onChange={(e) => setMercantilWebhookUrl(e.target.value)}
            placeholder="https://houmi-store.vercel.app/api/webhooks/mercantil"
            type="url"
          />
          <p className="text-xs text-gray-500">
            URL que debes proporcionar al banco para recibir confirmaciones de pago
          </p>

          {/* Probar conexión al banco */}
          <div className="pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={async () => {
                setTestResult(null);
                setIsTesting(true);
                try {
                  const res = await fetch("/api/admin/test-mercantil");
                  const data = await res.json();
                  setTestResult({
                    ok: data.ok === true,
                    message: data.message || (data.ok ? "Conexión correcta" : "Error"),
                    detail: data.detail,
                  });
                } catch {
                  setTestResult({ ok: false, message: "Error de red", detail: "No se pudo conectar al servidor" });
                }
                setIsTesting(false);
              }}
              disabled={isTesting || !mercantilApiUrl?.trim() || !mercantilApiKey?.trim()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              Probar conexión al banco
            </button>
            {testResult && (
              <div className={`mt-2 p-3 rounded-lg text-sm ${testResult.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                <p className="font-medium">{testResult.message}</p>
                {testResult.detail && <p className="mt-1 text-xs opacity-90">{testResult.detail}</p>}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Save button */}
      <div className="lg:col-span-2">
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Configuración guardada
                </p>
              )}
            </div>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Guardar cambios
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

