import { NextRequest, NextResponse } from "next/server";
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

// GET all expenses
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Error al obtener gastos" },
      { status: 500 }
    );
  }
}

// CREATE new expense
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { category, description, amountUsd, amountVes, date } = body;

    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amountUsd,
        amountVes,
        date: new Date(date),
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Error al crear gasto" },
      { status: 500 }
    );
  }
}
