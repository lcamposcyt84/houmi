import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "houmi-store-secret-key-change-in-production"
);

export interface CustomerSession {
  customerId: string;
  email: string;
  firstName: string;
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

export async function createCustomerToken(
  customerId: string,
  email: string,
  firstName: string
): Promise<string> {
  return new SignJWT({ customerId, email, firstName })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d") // Customers get 30-day sessions
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyCustomerToken(
  token: string
): Promise<CustomerSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as CustomerSession;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_token")?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export async function isCustomerAuthenticated(): Promise<boolean> {
  const session = await getCustomerSession();
  return session?.customerId != null;
}

export async function setCustomerCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("customer_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function clearCustomerCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("customer_token");
}

export async function getAuthenticatedCustomer() {
  const session = await getCustomerSession();
  if (!session) return null;
  return prisma.customer.findUnique({
    where: { id: session.customerId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      emailVerified: true,
      createdAt: true,
    },
  });
}
