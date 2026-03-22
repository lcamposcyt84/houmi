import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDebugInfo("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión");
        // Mostrar info de debug si existe
        if (data.debug) {
          setDebugInfo(JSON.stringify(data.debug, null, 2));
        }
        setIsLoading(false);
        return;
      }

      navigate("/admin/dashboard");
          } catch {
      setError("Error de conexión");
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {debugInfo && (
          <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-xs font-mono overflow-auto">
            <p className="font-bold mb-1">Debug Info:</p>
            <pre>{debugInfo}</pre>
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@houmi.com"
          required
          autoComplete="email"
        />

        <div>
          <label className="block text-sm font-medium text-brand-text mb-1">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-200 bg-white text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-5 h-5" />}
        >
          Iniciar sesión
        </Button>
      </form>
    </Card>
  );
}
