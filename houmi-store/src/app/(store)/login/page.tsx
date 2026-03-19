"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
      } else {
        // Redirect to account or to the page they came from
        const params = new URLSearchParams(window.location.search);
        router.push(params.get("redirect") || "/account");
        router.refresh();
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="text-2xl font-bold text-brand-text font-display">Iniciar sesión</h1>
            <p className="text-brand-text-muted mt-2 text-sm">
              Accede a tu cuenta para ver tus pedidos y favoritos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tucorreo@ejemplo.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center text-sm text-brand-text-muted">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-brand-primary font-semibold hover:underline">
              Regístrate gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
