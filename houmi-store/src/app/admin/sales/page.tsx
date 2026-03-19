import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SalesTable } from "./SalesTable";

export const metadata: Metadata = {
  title: "Ventas | Admin",
  description: "Gestión de ventas",
};

async function getSales() {
  const [sales, settings] = await Promise.all([
    prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    }),
    prisma.settings.findUnique({ where: { id: "main" } }),
  ]);

  return {
    sales,
    exchangeRate: settings?.exchangeRateUsdToVes || 40,
  };
}

export default async function SalesPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { sales, exchangeRate } = await getSales();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Ventas</h1>
          <p className="text-brand-text-muted">
            Historial de todas las ventas
          </p>
        </div>
      </div>

      <SalesTable sales={sales} exchangeRate={exchangeRate} />
    </div>
  );
}
