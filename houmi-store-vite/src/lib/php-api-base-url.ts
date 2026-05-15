/**
 * URL base de la API PHP (sin barra final).
 * - Producción: define NEXT_PUBLIC_API_URL en Vercel (p. ej. https://api.houmi.shop).
 * - Si falta la variable y el build es production, se usa la API pública del proyecto.
 * - Desarrollo: XAMPP según ruta del repo.
 */
export function getPhpApiBaseUrl(): string {
  // Fuerza la URL de producción cuando se ejecuta `npm run build`
  if (import.meta.env.PROD) {
    return "https://api.houmi.shop";
  }

  // De lo contrario usa variables de entorno local o localhost estricto
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  
  return "http://localhost/houmi-master/houmi-store/api";
}
