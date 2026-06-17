/**
 * admin-functions.ts
 * Funciones del panel de administración — portadas desde la versión Next.js/Vercel.
 *
 * Diferencia clave respecto a la versión Vercel:
 *  - Vercel: usa cookies HTTP-only + Prisma (server-side)
 *  - Vite:   usa sessionStorage + phpFetch (client-side)
 *
 * Las firmas y nombres de funciones son idénticos para facilitar
 * la migración futura de vuelta a Next.js si fuera necesario.
 */

import { phpFetch } from "@/lib/php-client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AdminSession {
  email: string;
  isAdmin: boolean;
  exp: number;
  role?: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  lowStockProducts: number;
  totalSalesUsd: number;
  totalSalesCount: number;
  totalExpensesUsd: number;
  totalExpensesCount: number;
  totalPurchasesUsd: number;
  totalPurchasesCount: number;
  exchangeRate: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentSales: RecentSale[];
}

export interface RecentSale {
  id: string;
  orderNumber: string;
  customerName: string;
  totalUsd: number;
  status: string;
  createdAt: Date;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
  }>;
}

// ─── Token helpers ─────────────────────────────────────────────────────────────

const ADMIN_TOKEN_KEY = "houmi_admin_token";

/** Lee el token de administrador guardado en sessionStorage. */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

/** Guarda el token de administrador en sessionStorage tras el login. */
export function saveAdminToken(token: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

/** Elimina el token de administrador (logout). */
export function clearAdminToken(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem("houmi_auth_token");
  }
}

// ─── Sesión ────────────────────────────────────────────────────────────────────

/**
 * Obtiene la sesión del administrador actual.
 * Equivalente a getAdminSession() de la versión Vercel, pero en lugar de
 * leer cookies y verificar JWT en el servidor, decodifica el payload del JWT
 * almacenado en sessionStorage.
 */
export function getAdminSession(): AdminSession | null {
  const token = getAdminToken();
  if (!token) return null;

  try {
    // Decodificar el payload del JWT (sin verificar firma — la verificación
    // ocurre en el servidor PHP al validar cada request)
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const payload = JSON.parse(atob(payloadBase64));

    // Verificar expiración
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      clearAdminToken();
      return null;
    }

    return {
      email: payload.email || "",
      isAdmin: payload.isAdmin === true,
      exp: payload.exp || 0,
      role: payload.role || "admin",
    };
  } catch {
    return null;
  }
}

/**
 * Devuelve true si hay una sesión de administrador válida.
 * Equivalente a isAdminAuthenticated() de la versión Vercel.
 */
export function isAdminAuthenticated(): boolean {
  const session = getAdminSession();
  return session?.isAdmin === true;
}

/**
 * Cierra la sesión del administrador:
 * llama al endpoint PHP de logout y limpia el token local.
 * Equivalente a clearAdminCookie() de la versión Vercel.
 */
export async function clearAdminSession(): Promise<void> {
  try {
    await phpFetch("admin/logout", { method: "POST" });
  } catch {
    // Silencioso: limpiar localmente aunque el servidor falle
  } finally {
    clearAdminToken();
  }
}

// ─── Dashboard data ────────────────────────────────────────────────────────────

/**
 * Obtiene los datos del dashboard desde la API PHP.
 * Equivalente a getDashboardData() de la versión Vercel, pero con phpFetch
 * en lugar de fetch() con reenvío de cookies de servidor.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const empty: DashboardData = {
    stats: {
      totalProducts: 0,
      activeProducts: 0,
      totalCategories: 0,
      lowStockProducts: 0,
      totalSalesUsd: 0,
      totalSalesCount: 0,
      totalExpensesUsd: 0,
      totalExpensesCount: 0,
      totalPurchasesUsd: 0,
      totalPurchasesCount: 0,
      exchangeRate: 40,
    },
    recentSales: [],
  };

  try {
    const res = await phpFetch("admin/dashboard");

    if (!res.ok) return empty;

    const data = await res.json();

    return {
      stats: {
        totalProducts:      data.metrics?.totalProducts      || 0,
        activeProducts:     data.metrics?.activeProducts     || 0,
        totalCategories:    data.metrics?.totalCategories    || 0,
        lowStockProducts:   data.metrics?.lowStock           || 0,
        totalSalesUsd:      data.metrics?.totalSalesUsd      || 0,
        totalSalesCount:    data.metrics?.totalSalesCount    || 0,
        totalExpensesUsd:   data.metrics?.totalExpensesUsd   || 0,
        totalExpensesCount: data.metrics?.totalExpensesCount || 0,
        totalPurchasesUsd:  data.metrics?.totalPurchasesUsd  || 0,
        totalPurchasesCount:data.metrics?.totalPurchasesCount|| 0,
        exchangeRate:       data.exchangeRate                || 40,
      },
      recentSales: data.recentSales || [],
    };
  } catch (e) {
    console.error("getDashboardData error:", e);
    return empty;
  }
}
