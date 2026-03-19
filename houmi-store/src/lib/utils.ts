import { type ClassValue, clsx } from "clsx";

/**
 * Merge class names with clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Slugify a string for URLs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-VE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-VE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Delay execution (for loading states, etc)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if we're on the client side
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Get stock status label
 */
export function getStockStatus(stock: number): {
  label: string;
  variant: "success" | "warning" | "error";
} {
  if (stock === 0) {
    return { label: "Agotado", variant: "error" };
  }
  if (stock <= 5) {
    return { label: "Pocas unidades", variant: "warning" };
  }
  return { label: "Disponible", variant: "success" };
}





