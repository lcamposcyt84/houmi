import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Prueba la conexión con la API del Banco Mercantil usando las credenciales configuradas.
 * GET /api/admin/test-mercantil
 */
export async function GET() {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const settings = await prisma.settings.findUnique({
      where: { id: "main" },
    });

    const apiUrl = (settings?.mercantilApiUrl || process.env.MERCANTIL_API_URL || "").replace(/\/$/, "");
    const apiPathRaw = (settings?.mercantilApiPath ?? "").trim();
    const pathSegment = apiPathRaw === "" ? "" : apiPathRaw.startsWith("/") ? apiPathRaw : `/${apiPathRaw}`;
    const apiKey = settings?.mercantilApiKey || process.env.MERCANTIL_API_KEY;
    const apiSecret = settings?.mercantilApiSecret || process.env.MERCANTIL_API_SECRET;

    if (!apiUrl || !apiKey) {
      return NextResponse.json({
        ok: false,
        message: "Faltan datos",
        detail: "Configura URL de la API y Clave API en Configuración → Banco Mercantil.",
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(apiSecret
        ? { "X-API-Key": apiKey, "X-API-Secret": apiSecret }
        : { Authorization: `Bearer ${apiKey}` }),
    };

    // Intentar endpoints típicos de verificación (health, status, o raíz)
    const endpointsToTry = ["/health", "/status", "/", "/v1/health", "/v1/status"];
    let lastStatus = 0;
    let lastError = "";

    for (const path of endpointsToTry) {
      try {
        const res = await fetch(`${apiUrl}${path}`, {
          method: "GET",
          headers,
          signal: AbortSignal.timeout(10000),
        });
        lastStatus = res.status;
        const text = await res.text();
        if (res.ok) {
          return NextResponse.json({
            ok: true,
            message: "Conexión con el banco correcta",
            detail: `HTTP ${res.status}. La URL responde. Puedes probar un pago C2P real.`,
          });
        }
        if (res.status === 401) {
          return NextResponse.json({
            ok: false,
            message: "Credenciales rechazadas",
            detail: `El banco respondió 401 Unauthorized. Revisa API Key y Secreto en el portal del banco.`,
          });
        }
        lastError = text || res.statusText;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    try {
      const testUrl = pathSegment ? `${apiUrl}${pathSegment}` : apiUrl;
      const res = await fetch(testUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          orderNumber: "TEST-CONNECTION",
          idType: "V",
          idNumber: "00000000",
          bank: "0105",
          phone: "04140000000",
          c2pCode: "000000",
          amount: 0,
        }),
        signal: AbortSignal.timeout(10000),
      });
      lastStatus = res.status;
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return NextResponse.json({
          ok: true,
          message: "Conexión con el banco correcta",
          detail: "La API C2P respondió. Las credenciales son válidas.",
        });
      }
      if (res.status === 401) {
        return NextResponse.json({
          ok: false,
          message: "Credenciales rechazadas",
          detail: "El banco respondió 401. Revisa API Key y Secreto.",
        });
      }
      if (res.status === 400 || res.status === 422) {
        return NextResponse.json({
          ok: true,
          message: "Conexión con el banco correcta",
          detail: `La API respondió (${res.status}). Las credenciales son válidas; el error puede ser por datos de prueba.`,
        });
      }
      if (res.status === 404) {
        return NextResponse.json({
          ok: false,
          message: "Ruta no encontrada (404)",
          detail: `La URL ${testUrl} no existe en el servidor del banco. Prueba en Configuración: deja "Ruta del endpoint C2P" vacía, o usa otra ruta (ej. /c2p, /payment).`,
        });
      }
      lastError = (data?.message || data?.error || res.statusText) as string;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    }

    return NextResponse.json({
      ok: false,
      message: "No se pudo conectar al banco",
      detail: lastStatus
        ? `HTTP ${lastStatus}. ${lastError || "Revisa la URL y que el banco tenga habilitada la API."}`
        : `Error: ${lastError}. ¿La URL de la API es correcta?`,
    });
  } catch (error) {
    console.error("Test Mercantil error:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno", detail: String(error) },
      { status: 500 }
    );
  }
}
