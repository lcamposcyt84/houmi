/**
 * php-client.ts
 * Client-side helper for all PHP backend API calls.
 *
 * Strategy:
 *  - JWT is stored in localStorage after login (avoids SameSite/Secure cookie issues on HTTP local dev)
 *  - Every client-side fetch includes Authorization: Bearer <token>
 *  - SSR server-side fetches forward the cookie directly (no cross-origin issue server-to-server)
 */

import { getPhpApiBaseUrl } from "@/lib/php-api-base-url";

export const PHP_API_URL = getPhpApiBaseUrl();

/** Build a full URL to a PHP endpoint. Handles query strings correctly. */
export function phpUrl(path: string): string {
  // Split path from query string
  const [basePath, query] = path.split("?");
  
  // Ensure the base path ends with .php if it doesn't already
  const finalBasePath = basePath.endsWith(".php") ? basePath : `${basePath}.php`;
  
  // Reconstruct URL
  return `${PHP_API_URL}/${finalBasePath}${query ? "?" + query : ""}`;
}

// ─── Token helpers (localStorage) ────────────────────────────────────────────

const TOKEN_KEY = "houmi_auth_token";

/** Save the JWT after a successful login/register. */
export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/** Read the stored JWT. Returns null if not logged in. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Remove the JWT (logout). */
export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ─── Auth headers ─────────────────────────────────────────────────────────────

/**
 * Returns headers containing the Authorization Bearer token if logged in.
 * Merge with your own headers: { ...authHeaders(), "Content-Type": "application/json" }
 */
export function authHeaders(): Record<string, string> {
    const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {};
}

// ─── Authenticated fetch wrapper ──────────────────────────────────────────────

/**
 * Convenience wrapper: calls phpUrl(path) and automatically injects the auth header.
 * Usage: phpFetch("wishlist/get")
 *        phpFetch("reviews/create", { method: "POST", body: JSON.stringify(data) })
 */
export async function phpFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = phpUrl(path);
  // Don't force Content-Type for FormData — the browser sets the multipart boundary
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...authHeaders(),
    ...(options.headers as Record<string, string> | undefined),
  };
  return fetch(url, { ...options, headers });
}
