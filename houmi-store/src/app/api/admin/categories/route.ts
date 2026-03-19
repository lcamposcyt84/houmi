import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function isAuthenticated() {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  const session = await verifyAdminToken(token);
  return session?.isAdmin === true;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
