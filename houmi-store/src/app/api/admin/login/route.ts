import { NextRequest, NextResponse } from "next/server";
import { validateAdminCredentials, createAdminToken, setAdminCookie } from "@/lib/auth";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting by IP
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    try {
      await limiter.check(5, ip); // 5 requests per minute per IP
    } catch {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const isValid = await validateAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = await createAdminToken(email);
    await setAdminCookie(token);

    return NextResponse.json({
      success: true,
      message: "Login exitoso",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}





