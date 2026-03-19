import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createCustomerToken, setCustomerCookie } from "@/lib/customer-auth";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(7).max(20).optional(),
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
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, phone } = parsed.data;

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const customer = await prisma.customer.create({
      data: { email, password: hashedPassword, firstName, lastName, phone },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const token = await createCustomerToken(customer.id, customer.email, customer.firstName);
    await setCustomerCookie(token);

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
