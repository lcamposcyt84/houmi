import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Procesa un pago C2P (Pago Móvil)
 * POST /api/payments/c2p
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderNumber,
      idType,
      idNumber,
      bank,
      phone,
      c2pCode,
      amount,
    } = body;

    // Validaciones
    if (!orderNumber || !idNumber || !bank || !phone || !c2pCode) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Buscar el pedido
    const order = await prisma.sale.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Credenciales desde configuración administrativa (Admin → Configuración → Banco Mercantil)
    const settings = await prisma.settings.findUnique({
      where: { id: "main" },
    });

    const apiKey = settings?.mercantilApiKey || process.env.MERCANTIL_API_KEY;
    const apiSecret = settings?.mercantilApiSecret || process.env.MERCANTIL_API_SECRET;
    const apiBaseUrl = (settings?.mercantilApiUrl || process.env.MERCANTIL_API_URL || "").replace(/\/$/, "");
    const apiPath = (settings?.mercantilApiPath ?? process.env.MERCANTIL_API_PATH ?? "/api").trim() || "";
    const pathSegment = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;

    let paymentReference = `C2P-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    let simulation = true;

    // Si hay URL de API y credenciales, intentar llamada real al banco
    if (apiBaseUrl && apiKey) {
      try {
        const paymentApiUrl = pathSegment ? `${apiBaseUrl}${pathSegment}` : apiBaseUrl;
        let phoneNormalized = phone.replace(/\D/g, "");
        if (!phoneNormalized.startsWith("58")) phoneNormalized = `58${phoneNormalized}`;
        if (phoneNormalized.length === 13 && phoneNormalized.startsWith("580"))
          phoneNormalized = "58" + phoneNormalized.slice(3);
        const payload = {
          orderNumber,
          idType,
          idNumber,
          bank,
          phone: phoneNormalized,
          c2pCode,
          amount: amount ?? order.totalVes,
        };
        const bankResponse = await fetch(paymentApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiSecret
              ? { "X-API-Key": apiKey, "X-API-Secret": apiSecret }
              : { Authorization: `Bearer ${apiKey}` }),
          },
          body: JSON.stringify(payload),
        });

        const rawText = await bankResponse.text();
        let bankData: Record<string, unknown> = {};
        try {
          bankData = rawText ? JSON.parse(rawText) : {};
        } catch {
          bankData = { message: rawText || bankResponse.statusText };
        }

        const bankRef =
          (bankData?.reference as string) ??
          (bankData?.data as Record<string, unknown>)?.reference ??
          bankData?.id ??
          bankData?.transactionId ??
          bankData?.referencia;
        if (bankResponse.ok) {
          if (bankRef) paymentReference = String(bankRef);
          simulation = false;
        } else {
          const errMsg =
            (bankData?.message as string) ??
            (bankData?.mensajeCliente as string) ??
            (bankData?.mensajeSistema as string) ??
            (bankData?.error as string) ??
            (Array.isArray(bankData?.errors) ? (bankData.errors[0] as string) : null) ??
            (bankData?.detail as string) ??
            (typeof rawText === "string" && rawText.length < 500 ? rawText : null) ??
            `Error del banco (${bankResponse.status})`;
          console.error("C2P bank error:", bankResponse.status, bankData);
          return NextResponse.json(
            { error: errMsg || "Error al procesar el pago con el banco" },
            { status: 402 }
          );
        }
      } catch (err) {
        console.error("Error llamando API C2P del banco:", err);
        return NextResponse.json(
          { error: "No se pudo conectar con el banco. Revise la URL y credenciales." },
          { status: 502 }
        );
      }
    }

    // Actualizar el pedido
    await prisma.sale.update({
      where: { orderNumber },
      data: {
        paymentMethod: "c2p",
        paymentStatus: "processing",
        bankReference: paymentReference,
      },
    });

    return NextResponse.json({
      success: true,
      reference: paymentReference,
      simulation,
      message: simulation
        ? "Solicitud registrada en modo prueba. No se contactó al banco; configura la URL de la API en Admin → Configuración para pagos reales."
        : "Pago C2P procesado correctamente",
    });
  } catch (error) {
    console.error("Error processing C2P payment:", error);
    return NextResponse.json(
      { error: "Error al procesar el pago C2P" },
      { status: 500 }
    );
  }
}
