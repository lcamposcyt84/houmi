import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "houmi-store-secret-key-change-in-production"
);

// Routes that require admin authentication
const protectedAdminRoutes = [
  "/admin/products",
  "/admin/bulk-pricing",
  "/admin/settings",
];

// API routes that require admin authentication
const protectedApiRoutes = [
  "/api/admin/products",
  "/api/admin/bulk-price",
  "/api/admin/settings",
  "/api/admin/logout",
];

// Customer account pages requiring login
const protectedCustomerRoutes = [
  "/account",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── ADMIN protection ───────────────────────────────────────────
  const isProtectedAdminPage = protectedAdminRoutes.some((r) => pathname.startsWith(r));
  const isProtectedAdminApi = protectedApiRoutes.some((r) => pathname.startsWith(r));

  if (isProtectedAdminPage || isProtectedAdminApi) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      if (isProtectedAdminApi) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      if (isProtectedAdminApi) return NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_token");
      return response;
    }
  }

  // ─── CUSTOMER protection ─────────────────────────────────────────
  const isProtectedCustomerPage = protectedCustomerRoutes.some((r) => pathname.startsWith(r));

  if (isProtectedCustomerPage) {
    const token = request.cookies.get("customer_token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("customer_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/account/:path*",
  ],
};






