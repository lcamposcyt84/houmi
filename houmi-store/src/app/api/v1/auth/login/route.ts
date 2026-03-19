import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  verifyPassword,
  createCustomerToken,
  setCustomerCookie,
} from "@/lib/customer-auth";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  try {
    await limiter.check(5, ip);
  } catch {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !customer.isActive) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, customer.password);
    if (!isValid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // Update last login
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLogin: new Date() },
    });

    const token = await createCustomerToken(customer.id, customer.email, customer.firstName);
    await setCustomerCookie(token);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
