import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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
    console.error("Error fetching admin settings:", error);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      exchangeRateUsdToVes,
      storeName,
      storeDescription,
      whatsappNumber,
      mercantilApiUrl,
      mercantilApiPath,
      mercantilApiKey,
      mercantilApiSecret,
      mercantilMasterKey,
      mercantilIdComercio,
      mercantilWebhookUrl,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (typeof exchangeRateUsdToVes === "number" && exchangeRateUsdToVes > 0) {
      updateData.exchangeRateUsdToVes = exchangeRateUsdToVes;
    }

    if (typeof storeName === "string" && storeName.trim()) {
      updateData.storeName = storeName.trim();
    }

    if (typeof storeDescription === "string") {
      updateData.storeDescription = storeDescription.trim() || null;
    }

    if (typeof whatsappNumber === "string") {
      updateData.whatsappNumber = whatsappNumber.trim() || null;
    }

    if (typeof mercantilApiUrl === "string") {
      updateData.mercantilApiUrl = mercantilApiUrl.trim() || null;
    }

    if (typeof mercantilApiPath === "string") {
      updateData.mercantilApiPath = mercantilApiPath.trim() || null;
    }

    if (typeof mercantilApiKey === "string") {
      updateData.mercantilApiKey = mercantilApiKey.trim() || null;
    }

    if (typeof mercantilApiSecret === "string") {
      updateData.mercantilApiSecret = mercantilApiSecret.trim() || null;
    }

    if (typeof mercantilMasterKey === "string") {
      updateData.mercantilMasterKey = mercantilMasterKey.trim() || null;
    }

    if (typeof mercantilIdComercio === "string") {
      updateData.mercantilIdComercio = mercantilIdComercio.trim() || null;
    }

    if (typeof mercantilWebhookUrl === "string") {
      updateData.mercantilWebhookUrl = mercantilWebhookUrl.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No hay datos para actualizar" },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.upsert({
      where: { id: "main" },
      update: updateData,
      create: {
        id: "main",
        exchangeRateUsdToVes: exchangeRateUsdToVes || 40,
        storeName: storeName || "Houmi Store",
        storeDescription: storeDescription || null,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}





