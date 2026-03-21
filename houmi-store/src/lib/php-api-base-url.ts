/**
 * URL base de la API PHP (sin barra final).
 * - Producción: define NEXT_PUBLIC_API_URL en Vercel (p. ej. https://api.houmi.shop).
 * - Si falta la variable y el build es production, se usa la API pública del proyecto.
 * - Desarrollo: XAMPP según ruta del repo.
 */
export function getPhpApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    return "https://api.houmi.shop";
  }
  return "http://localhost/houmi-master/houmi-store/api";
}
