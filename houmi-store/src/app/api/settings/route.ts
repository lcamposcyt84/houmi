import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "main" },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "main",
          exchangeRateUsdToVes: 40,
          storeName: "Houmi Store",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}





