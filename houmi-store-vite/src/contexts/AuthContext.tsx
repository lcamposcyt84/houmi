import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { phpFetch, clearToken } from "@/lib/php-client";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface AuthContextValue {
  customer: Customer | null;
  isLoggedIn: boolean;
  loading: boolean;
  refresh: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAuth = useCallback(() => {
    phpFetch("auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.customer) setCustomer(data.customer);
        else setCustomer(null);
      })
      .catch(() => setCustomer(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAuth();
  }, [fetchAuth]);

  const logout = useCallback(() => {
    clearToken();
    setCustomer(null);
    phpFetch("auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ customer, isLoggedIn: !!customer, loading, refresh: fetchAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
