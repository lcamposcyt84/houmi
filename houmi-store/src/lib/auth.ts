import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "houmi-store-secret-key-change-in-production"
);

// Limpiar caracteres de salto de línea que pueden venir de las variables de entorno
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@houmi.com").trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "houmi2024secure").trim();

export interface AdminSession {
  email: string;
  isAdmin: boolean;
  exp: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

import { prisma } from "./db";

export async function validateAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      return false;
    }

    return await verifyPassword(password, admin.password);
  } catch (error) {
    console.error("Error validating admin credentials:", error);
    return false;
  }
}

export async function createAdminToken(email: string): Promise<string> {
  const admin = await prisma.admin.findUnique({ where: { email } });
  const role = admin?.role || "admin";

  const token = await new SignJWT({ email, isAdmin: true, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

export async function verifyAdminToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) return null;

  return verifyAdminToken(token);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return session?.isAdmin === true;
}

export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
}





