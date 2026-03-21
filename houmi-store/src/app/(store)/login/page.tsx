"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { phpFetch, saveToken, getToken } from "@/lib/php-client";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-redirect if already logged in (checks localStorage token)
  useEffect(() => {
    phpFetch("auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.customer) {
          // Fix the infinite loop: if localStorage has the token but the browser doesn't have the cookie,
          // we must sync it BEFORE redirecting to /account, otherwise the server will bounce us back.
          const token = getToken();
          if (token) {
            document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
          }
          const params = new URLSearchParams(window.location.search);
          // Hard redirect to bypass stale Next.js App Router cache that traps us in the loop
          window.location.href = params.get("redirect") || "/account";
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await phpFetch("auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
      } else {
        // Persist JWT for subsequent client-side calls
        if (data.token) {
          saveToken(data.token);
          // FORCE the cookie on the Next.js domain so SSR correctly reads it for /account layout
          document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        }
        
        // Wait a small tick so cookie persists before forcing hard navigation
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          window.location.href = params.get("redirect") || "/account";
        }, 100);
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
