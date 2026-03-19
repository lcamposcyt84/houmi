import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/customer-auth";

export async function GET() {
  try {
    const customer = await getAuthenticatedCustomer();
    if (!customer) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Error getting customer session:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
