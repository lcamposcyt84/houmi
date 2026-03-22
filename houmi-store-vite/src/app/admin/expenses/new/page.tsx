import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Card, Button, Input } from "@/components/ui";

const categories = [
  { value: "rent", label: "Alquiler" },
  { value: "utilities", label: "Servicios (agua, luz, internet)" },
  { value: "marketing", label: "Marketing y publicidad" },
  { value: "supplies", label: "Suministros" },
  { value: "salary", label: "Salarios" },
  { value: "transport", label: "Transporte" },
  { value: "other", label: "Otros" },
];

export default function NewExpensePage() {
  const navigate = useNavigate();
  const [exchangeRate, setExchangeRate] = useState(40);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setExchangeRate(data.exchangeRateUsdToVes || 40);
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("La descripción es requerida");
      return;
    }
    if (!amountUsd || parseFloat(amountUsd) <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          amountUsd: parseFloat(amountUsd),
          amountVes: parseFloat(amountUsd) * exchangeRate,
          date: new Date(date),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear gasto");
      }

      navigate("/admin/expenses");
          } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear gasto");
    } finally {
      setIsLoading(false);
    }
  };

  const amountVes = amountUsd ? parseFloat(amountUsd) * exchangeRate : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/admin/expenses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Nuevo Gasto</h1>
          <p className="text-brand-text-muted">Registrar un gasto operativo</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-brand-text focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Descripción *"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pago de alquiler mes de enero"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Monto USD ($) *"
                type="number"
                step="0.01"
                min="0"
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                placeholder="0.00"
                required
              />
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Equivalente VES (Bs)
                </label>
                <div className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-brand-text">
                  Bs {amountVes.toFixed(2)}
                </div>
                <p className="text-xs text-brand-text-muted mt-1">
                  Tasa: $1 = Bs {exchangeRate.toFixed(2)}
                </p>
              </div>
            </div>

            <Input
              label="Fecha"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Registrar Gasto
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
