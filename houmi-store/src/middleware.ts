import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Must match the secret used in api/auth/jwt.php and api/admin/login.php
const JWT_SECRET = new TextEncoder().encode(
  "1ad4f5bc6463a575304c28de4ccb4ebd3a1f2977b368f0e25c93cd381af40254"
);

// Pages that require admin login
const protectedAdminRoutes = [
  "/admin/dashboard",
  "/admin/products",
  "/admin/orders",
  "/admin/sales",
  "/admin/purchases",
  "/admin/expenses",
  "/admin/settings",
  "/admin/bulk-pricing",
];

// Customer account pages requiring login
const protectedCustomerRoutes = ["/account"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── ADMIN protection ─────────────────────────────────────────────────────
  const isProtectedAdmin = protectedAdminRoutes.some((r) => pathname.startsWith(r));

  if (isProtectedAdmin) {
    // PHP admin login sets "admin_session" cookie
    const token =
      request.cookies.get("admin_session")?.value ||
      request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_session");
      response.cookies.delete("admin_token");
      return response;
    }
  }

  // ─── CUSTOMER protection ───────────────────────────────────────────────────
  const isProtectedCustomer = protectedCustomerRoutes.some((r) => pathname.startsWith(r));

  if (isProtectedCustomer) {
    // PHP customer login sets "auth_token" cookie (or a Bearer token in localStorage).
    // Since middleware runs server-side, we can only check the cookie here.
    // If the user is using localStorage auth, we fall through and let the page handle it.
    const token =
      request.cookies.get("auth_token")?.value ||
      request.cookies.get("customer_session")?.value;

    if (!token) {
      // Don't hard-redirect — the page will show a login prompt.
      // This allows localStorage-based auth (which the page will check client-side).
      return NextResponse.next();
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (e) {
      console.error("MIDDLEWARE CUSTOMER JWT ERROR:", e);
      // Invalid token — clear it and pass through (page handles the UI)
      const response = NextResponse.next();
      response.cookies.delete("auth_token");
      response.cookies.delete("customer_session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
  ],
};







